"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  PdfLoader,
  PdfHighlighter,
  Tip,
  Highlight,
  Popup,
  AreaHighlight,
} from "react-pdf-highlighter";
import type { IHighlight, NewHighlight } from "react-pdf-highlighter";
import "pdfjs-dist/web/pdf_viewer.css"; // Ensure text layer is styled correctly
import "react-pdf-highlighter/dist/style.css"; // Ensure CSS is imported
import { MessageSquare, Trash2, Save, PlusCircle } from "lucide-react";

if (typeof window !== "undefined") {
  const originalError = console.error;
  console.error = (...args) => {
    const msg = args.join(" ");
    if (msg.includes("Unknown event handler property `onUpdate`") || msg.includes("onUpdate")) {
      return; // Suppress react-pdf-highlighter warning
    }
    originalError.apply(console, args);
  };
}

const getNextId = () => String(Math.random()).slice(2);

const parseIdFromHash = () =>
  typeof window !== "undefined" ? window.location.hash.slice(1) : "";

const resetHash = () => {
  if (typeof window !== "undefined") {
    window.location.hash = "";
  }
};

interface PdfReviewerProps {
  pdfUrl: string;
  reportId: number;
  initialAnnotations?: Array<IHighlight>;
  onSave?: (annotations: Array<IHighlight>) => void;
  readOnly?: boolean;
}

const CustomTip = ({
  onConfirm,
}: {
  onConfirm: (comment: { text: string; emoji: string; type: "comment" | "add_text" }) => void;
}) => {
  const [text, setText] = useState("");

  return (
    <div className="bg-white p-3 rounded-md shadow-lg border border-gray-200 w-72 flex flex-col gap-2"
      onMouseDown={(e) => e.stopPropagation()} // Prevent closing when clicking inside
    >
      <textarea
        className="w-full text-sm border border-gray-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
        placeholder="បញ្ចូលការកែតម្រូវ ឫអត្ថបទ... (Enter text...)"
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
      />
      <div className="flex justify-end gap-2 mt-1">
        <button
          className="bg-indigo-600 text-white px-3 py-1.5 rounded text-xs hover:bg-indigo-700 transition-colors font-medium flex items-center"
          onClick={(e) => {
            e.preventDefault();
            onConfirm({ text, emoji: "", type: "comment" });
          }}
        >
          <MessageSquare className="w-3 h-3 mr-1" /> កត់ត្រាកំហុស
        </button>
        <button
          className="bg-red-500 text-white px-3 py-1.5 rounded text-xs hover:bg-red-600 transition-colors font-medium flex items-center"
          onClick={(e) => {
            e.preventDefault();
            onConfirm({ text, emoji: "", type: "add_text" });
          }}
        >
          <PlusCircle className="w-3 h-3 mr-1" /> បន្ថែមប្រយោគថ្មី
        </button>
      </div>
    </div>
  );
};

export function PdfReviewerInner({ pdfUrl, reportId, initialAnnotations = [], onSave, readOnly = false }: PdfReviewerProps) {
  const [highlights, setHighlights] = useState<Array<IHighlight>>(initialAnnotations);
  const [isPdfLoaded, setIsPdfLoaded] = useState(false);

  useEffect(() => {
    import("pdfjs-dist").then(pdfjsLib => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    });
  }, []);
  
  const scrollViewerTo = useRef((highlight: IHighlight) => {});
  
  useEffect(() => {
    if (initialAnnotations && initialAnnotations.length > 0) {
      setHighlights(initialAnnotations);
    }
  }, [initialAnnotations]);

  const scrollToHighlightFromHash = () => {
    const highlight = getHighlightById(parseIdFromHash());
    if (highlight) {
      scrollViewerTo.current(highlight);
    }
  };

  useEffect(() => {
    window.addEventListener("hashchange", scrollToHighlightFromHash, false);
    return () => {
      window.removeEventListener("hashchange", scrollToHighlightFromHash, false);
    };
  }, []);

  const getHighlightById = (id: string) => {
    return highlights.find((highlight) => highlight.id === id);
  };

  const addHighlight = (highlight: NewHighlight) => {
    console.log("Saving highlight", highlight);
    const newHighlights = [{ ...highlight, id: getNextId() }, ...highlights];
    setHighlights(newHighlights);
  };

  const updateHighlight = (highlightId: string, position: Object, content: Object) => {
    console.log("Updating highlight", highlightId, position, content);
    setHighlights(
      highlights.map((h) => {
        const { id, position: originalPosition, content: originalContent, ...rest } = h;
        return id === highlightId
          ? {
              id,
              position: { ...originalPosition, ...position },
              content: { ...originalContent, ...content },
              ...rest,
            }
          : h;
      })
    );
  };

  const removeHighlight = (id: string) => {
    setHighlights(highlights.filter((h) => h.id !== id));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(highlights);
    }
  };

  const commentCount = highlights.filter((h) => (h.comment as any)?.type !== "add_text").length;
  const addTextCount = highlights.filter((h) => (h.comment as any)?.type === "add_text").length;

  return (
    <div className="flex h-full w-full bg-gray-50 border rounded-lg overflow-hidden">
      {/* Sidebar for Comments */}
      <div className="w-80 flex-shrink-0 bg-white border-r flex flex-col h-full">
        <div className="p-4 border-b bg-gray-100 flex justify-between items-center">
          <div className="flex flex-col">
            <h2 className="font-semibold text-gray-700 text-sm mb-1">
              បញ្ជីកែសម្រួល
            </h2>
            <div className="flex gap-2">
              <span className="bg-indigo-100 text-indigo-700 py-0.5 px-2 rounded-full text-xs flex items-center">
                <MessageSquare className="w-3 h-3 mr-1" /> {commentCount}
              </span>
              <span className="bg-red-100 text-red-700 py-0.5 px-2 rounded-full text-xs flex items-center">
                <PlusCircle className="w-3 h-3 mr-1" /> {addTextCount}
              </span>
            </div>
          </div>
          {!readOnly && (
            <button 
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-md text-xs font-medium flex items-center"
              title="រក្សាទុកការកែប្រែ"
            >
              <Save className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {highlights.length === 0 ? (
            <div className="text-center text-gray-500 text-sm mt-10">
              <p>មិនទាន់មានចំណុចកែប្រែនៅឡើយទេ។</p>
              {!readOnly && <p className="mt-2 text-xs">សូមអូស (Highlight) លើឯកសារដើម្បីបន្ថែមមតិ។</p>}
            </div>
          ) : (
            highlights.map((highlight, index) => (
              <div 
                key={highlight.id} 
                className="bg-white border rounded-md shadow-sm p-3 hover:border-indigo-400 cursor-pointer transition-colors relative"
                onClick={() => {
                  scrollViewerTo.current(highlight);
                }}
              >
                {!readOnly && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeHighlight(highlight.id);
                    }}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <div className="flex items-center gap-1 mb-2">
                  {(highlight.comment as any)?.type === "add_text" ? (
                    <>
                      <PlusCircle className="w-4 h-4 text-red-500" />
                      <span className="text-xs font-bold text-red-600 uppercase tracking-wider">បន្ថែមប្រយោគថ្មី</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4 text-indigo-500" />
                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">កែតម្រូវពាក្យ</span>
                    </>
                  )}
                </div>
                <div className="text-sm font-medium text-gray-800 pr-6 mb-1">
                  {highlight.content.text ? (
                    <blockquote className="border-l-2 border-indigo-300 pl-2 text-gray-600 italic text-xs mb-2 truncate">
                      {highlight.content.text}
                    </blockquote>
                  ) : null}
                  {highlight.comment?.text || <span className="text-gray-400 italic">គ្មានការកែតម្រូវ</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* PDF Document Viewer */}
      <div className="flex-1 relative h-[800px] overflow-auto">
        <PdfLoader 
          url={pdfUrl} 
          beforeLoad={<div className="flex items-center justify-center h-full">កំពុងទាញយកឯកសារ PDF... (Loading PDF...)</div>}
          errorMessage={<div className="flex items-center justify-center h-full text-red-500">មានបញ្ហាក្នុងការបើកឯកសារ PDF។ អាចមកពីឯកសារមិនទាន់រួចរាល់ ឫមានបញ្ហា Network។ សូម Refresh ម្តងទៀត!</div>}
          onError={(error) => console.error("PDF Load Error:", error)}
        >
          {(pdfDocument) => (
            <PdfHighlighter
              pdfDocument={pdfDocument}
              enableAreaSelection={(event) => event.altKey}
              onScrollChange={resetHash}
              // @ts-ignore
              scrollRef={(scrollTo) => {
                scrollViewerTo.current = scrollTo;
                scrollToHighlightFromHash();
              }}
              onSelectionFinished={(
                position,
                content,
                hideTipAndSelection,
                transformSelection
              ) => {
                if (readOnly) return null;
                return (
                  <CustomTip
                    onConfirm={(comment) => {
                      addHighlight({ content, position, comment });
                      hideTipAndSelection();
                    }}
                  />
                );
              }}
              highlightTransform={(
                highlight,
                index,
                setTip,
                hideTip,
                viewportToScaled,
                screenshot,
                isScrolledTo
              ) => {
                const isTextHighlight = !Boolean(highlight.content?.image);

                const component = isTextHighlight ? (
                  <Highlight
                    isScrolledTo={isScrolledTo}
                    position={highlight.position}
                    comment={highlight.comment}
                  />
                ) : (
                  <AreaHighlight
                    isScrolledTo={isScrolledTo}
                    highlight={highlight}
                    onChange={(boundingRect) => {
                      updateHighlight(
                        highlight.id,
                        { boundingRect: viewportToScaled(boundingRect) },
                        { image: screenshot(boundingRect) }
                      );
                    }}
                  />
                );

                const getTop = (pos: any) => {
                  const t = pos.boundingRect?.top ?? pos.rects?.[0]?.top ?? 0;
                  return typeof t === "string" ? parseFloat(t) : t;
                };
                
                const currentTop = getTop(highlight.position);
                const nearbyHighlights = highlights.filter((h) => 
                  h.position.pageNumber === highlight.position.pageNumber &&
                  Math.abs(getTop(h.position) - currentTop) < 20
                );
                // Simple stable check for first highlight on this line
                const isFirstOnLine = nearbyHighlights[0] === highlight;

                const commentsCount = nearbyHighlights.filter((h) => (h.comment as any)?.type !== "add_text").length;
                const addTextsCount = nearbyHighlights.filter((h) => (h.comment as any)?.type === "add_text").length;
                
                const badgeTop = highlight.position.boundingRect?.top ?? highlight.position.rects?.[0]?.top;
                
                // Calculate the left-most edge of the highlights on this line
                const minLeft = Math.min(...nearbyHighlights.map(h => {
                  const rect = h.position.boundingRect ?? h.position.rects?.[0];
                  const l = typeof (rect as any)?.left === "string" ? parseFloat((rect as any).left) : ((rect as any)?.left ?? 0);
                  return l;
                }));

                const badgeStyle: React.CSSProperties = {
                  position: "absolute",
                  top: typeof badgeTop === "number" ? `${badgeTop - 5}px` : `calc(${badgeTop} - 5px)`,
                  left: `${Math.max(minLeft - 65, 0)}px`, // Force to the far left of the text
                  zIndex: 9999, // Ensure it is above everything
                  display: "flex",
                  flexDirection: "row",
                  gap: "4px",
                  background: "white",
                  padding: "2px",
                  borderRadius: "4px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                  border: "1px solid #e5e7eb"
                };

                const Badge = isFirstOnLine ? (
                  <div 
                    style={badgeStyle} 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      scrollViewerTo.current(highlight);
                    }}
                  >
                    {commentsCount > 0 && (
                      <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200" title="កែតម្រូវពាក្យសរុប">
                        <MessageSquare className="w-3 h-3" /> {commentsCount}
                      </div>
                    )}
                    {addTextsCount > 0 && (
                      <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200" title="បន្ថែមប្រយោគថ្មីសរុប">
                        <PlusCircle className="w-3 h-3" /> {addTextsCount}
                      </div>
                    )}
                  </div>
                ) : null;

                return (
                  <Popup
                    popupContent={<div className="p-2 bg-white rounded shadow-lg text-sm max-w-xs">{highlight.comment?.text || "គ្មានការកែតម្រូវ"}</div>}
                    onMouseOver={(popupContent) => setTip(highlight, () => popupContent)}
                    onMouseOut={hideTip}
                    key={index}
                  >
                    <div>
                      {Badge}
                      {component}
                    </div>
                  </Popup>
                );
              }}
              highlights={highlights}
            />
          )}
        </PdfLoader>
      </div>
    </div>
  );
}
