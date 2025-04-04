import {useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react'

const createItems = () =>
  Array.from({length: 10_000}, (_, index) => ({
    id: Math.random().toString(36).slice(2),
    text: String(index),
  }))

interface UseFixedSizeListProps {
  itemsCount: number;
  itemHeight: number;
  listHeight: number;
  overscan?: number;
  scrollingDelay?: number;
  getScrollElement: () => HTMLElement | null;
}

const DEFAULT_OVERSCAN = 3
const DEFAULT_SCROLLING_DELAY = 150

function useFixedSizeList (props: UseFixedSizeListProps) {
  const {
    itemsCount,
    itemHeight,
    listHeight,
    overscan = DEFAULT_OVERSCAN,
    scrollingDelay = DEFAULT_SCROLLING_DELAY,
    getScrollElement,
  } = props
  const [scrollTop, setScrollTop] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)

  useLayoutEffect(() => {
    const scrollElement = getScrollElement()
    if (!scrollElement) {
      return
    }

    const handleScroll = () => {
      const scrollTop = scrollElement.scrollTop
      setScrollTop(scrollTop)
    }
    handleScroll()

    scrollElement.addEventListener('scroll', handleScroll)
    return () => {
      scrollElement.removeEventListener('scroll', handleScroll)
    }

  }, [])

  useEffect(() => {
    const scrollElement = getScrollElement()
    if (!scrollElement) {
      return
    }

    let timeoutId: number|null = null
    const handleScroll = () => {
      setIsScrolling(true)

      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      timeoutId = setTimeout(() => {
        setIsScrolling(false)
      }, scrollingDelay)
    }

    scrollElement.addEventListener('scroll', handleScroll)
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      scrollElement.removeEventListener('scroll', handleScroll)
    }

  }, [])

  const {virtualItems, startIndex, endIndex} = useMemo(() => {
    const rangeStart = scrollTop
    const rangeEnd = scrollTop + listHeight

    let startIndex = Math.floor(rangeStart / itemHeight)
    let endIndex = Math.ceil(rangeEnd / itemHeight)

    startIndex = Math.max(0, startIndex - overscan)
    endIndex = Math.min(itemsCount - 1, endIndex + overscan)

    const virtualItems = []

    for (let index = startIndex; index <= endIndex; index++) {
      virtualItems.push({
        index,
        offsetTop: index * itemHeight,
      })
    }
    return {virtualItems, startIndex, endIndex}
  }, [scrollTop, itemsCount])

  const totalHeight = itemsCount * itemHeight
  return {
    totalHeight,
    virtualItems,
    isScrolling,
    startIndex,
    endIndex
  }
}

const itemHeight = 40
const containerHeight = 600

export const Simple = () => {
  const [listItems, setListItems] = useState(createItems())
  const scrollElementRef = useRef<HTMLDivElement>(null)
  const {virtualItems, isScrolling, totalHeight} = useFixedSizeList({
    itemHeight,
    itemsCount: listItems.length,
    listHeight: containerHeight,
    getScrollElement: () => scrollElementRef.current,
  })

  return (
    <div style={{padding: '0 12px'}}>
      <h1>List</h1>
      <div style={{marginBottom: 12}}>
        <button
          onClick={() => setListItems((items) => items.slice().reverse())}
        >
          reverse
        </button>
      </div>
      <div
        ref={scrollElementRef}
        style={{
          height: containerHeight,
          overflow: 'auto',
          border: '1px solid lightgray',
          position: 'relative',
        }}
      >
        <div style={{height: totalHeight}}>
          {
            virtualItems.map((virtualItem) => {
              const item = listItems[virtualItem.index]
              return (
                <div
                  key={item.id}
                  style={{
                    position: 'absolute',
                    top: 0,
                    transform: `translateY(${virtualItem.offsetTop}px)`,
                    height: itemHeight,
                    padding: '6px 12px',
                  }}
                >
                  {isScrolling ? 'Scrolling...' : item.text}
                </div>
              )
            })
          }
        </div>
      </div>
    </div>
  )
}

