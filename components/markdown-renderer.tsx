"use client"

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Parse and render markdown-like content with better formatting
  const lines = content.split('\n')
  const elements: JSX.Element[] = []
  let currentList: string[] = []
  let key = 0

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`ul-${key++}`} className="space-y-2.5 mb-5">
          {currentList.map((item, idx) => (
            <li key={idx} className="text-foreground/90 leading-relaxed flex items-start gap-3 text-[15px]">
              <span className="text-primary mt-1 flex-shrink-0 font-bold">•</span>
              <span className="flex-1">{item}</span>
            </li>
          ))}
        </ul>
      )
      currentList = []
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Skip empty lines
    if (!line.trim()) {
      flushList()
      continue
    }

    // H2 headings (##)
    if (line.startsWith('## ')) {
      flushList()
      const text = line.replace('## ', '').trim()
      elements.push(
        <h2
          key={`h2-${key++}`}
          className="text-[17px] font-bold text-foreground mt-8 mb-4 first:mt-0 pb-2 border-b border-border/40"
        >
          {text}
        </h2>
      )
      continue
    }

    // List items (- or *)
    if (line.match(/^[\-\*]\s+/)) {
      const text = line.replace(/^[\-\*]\s+/, '').replace(/\*\*(.*?)\*\*/g, '$1').trim()
      currentList.push(text)
      continue
    }

    // Regular paragraph
    flushList()
    // Remove markdown bold syntax and clean up
    const text = line.replace(/\*\*(.*?)\*\*/g, '$1').trim()
    if (text) {
      elements.push(
        <p key={`p-${key++}`} className="text-foreground/90 mb-4 leading-relaxed text-[15px]">
          {text}
        </p>
      )
    }
  }

  flushList()

  return <div className="space-y-1">{elements}</div>
}
