import {
  useState,
  useMemo,
  useRef,
  useCallback,
  useEffect,
  useDeferredValue,
} from "react";
import {
  Search,
  ChevronRight,
  Gavel,
  BookOpen,
  AlertCircle,
  Info,
  Menu,
  X,
  ArrowLeft,
  Filter,
  ChevronDown,
  Scale,
  ScrollText,
  Snowflake,
  Download,
  Bookmark,
  MessageCircleHeart,
  Pencil,
  Target,
  FolderOpen,
  ClipboardCheck,
  Pin,
  PinOff,
  ExternalLink,
  Zap,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import { DOCUMENTS, allLawArticles } from "./data/lawData";
import { nghiDinh214Data, allNd214Articles } from "./data/nd214";
import { thongTu79Data, allTt79Articles } from "./data/tt79";
import { luatDienLucData, allDlArticles } from "./data/luatDienLuc";
import { nghiDinh18Data, allNd18Articles } from "./data/nd18";
import { thongTu42Data, allTt42Articles } from "./data/tt42";
import { Chapter, Article, DocumentData, UserNote } from "./types";
import { logoBase64 } from "./logoData";

const RobotIcon = ({ size = 24, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Base Shadow */}
    <ellipse cx="50" cy="94" rx="28" ry="5" fill="#cbd5e1" opacity="0.6" />

    {/* Ears */}
    <rect
      x="11"
      y="35"
      width="9"
      height="18"
      rx="4.5"
      fill="#7dd3fc"
      stroke="#1e293b"
      strokeWidth="3.5"
    />
    <rect
      x="80"
      y="35"
      width="9"
      height="18"
      rx="4.5"
      fill="#7dd3fc"
      stroke="#1e293b"
      strokeWidth="3.5"
    />

    {/* Ear inner lines */}
    <path
      d="M 15 40 Q 13 44 15 48"
      fill="none"
      stroke="#1e293b"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M 85 40 Q 87 44 85 48"
      fill="none"
      stroke="#1e293b"
      strokeWidth="2.5"
      strokeLinecap="round"
    />

    {/* Antenna Stem */}
    <line
      x1="50"
      y1="24"
      x2="50"
      y2="10"
      stroke="#1e293b"
      strokeWidth="3.5"
      strokeLinecap="round"
    />

    {/* Antenna Base */}
    <path
      d="M 40 24 C 40 16 60 16 60 24 Z"
      fill="#f8fafc"
      stroke="#1e293b"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />

    {/* Antenna Ball */}
    <circle
      cx="50"
      cy="10"
      r="6"
      fill="#7dd3fc"
      stroke="#1e293b"
      strokeWidth="3.5"
    />

    {/* Main Body */}
    <path
      d="M 30 50 L 70 50 C 85 75 65 92 50 92 C 35 92 15 75 30 50 Z"
      fill="#f8fafc"
      stroke="#1e293b"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />

    {/* Arms (Droplets) */}
    <path
      d="M 26 62 C 10 66 10 82 16 86 C 24 88 28 76 26 62 Z"
      fill="#f8fafc"
      stroke="#1e293b"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />
    <path
      d="M 74 62 C 90 66 90 82 84 86 C 76 88 72 76 74 62 Z"
      fill="#f8fafc"
      stroke="#1e293b"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />

    {/* Head */}
    <rect
      x="16"
      y="24"
      width="68"
      height="42"
      rx="21"
      fill="#f8fafc"
      stroke="#1e293b"
      strokeWidth="3.5"
    />

    {/* Face Screen */}
    <rect x="23" y="30" width="54" height="30" rx="15" fill="#1e293b" />

    {/* Eyes */}
    <circle cx="36" cy="44" r="5.5" fill="#7dd3fc" />
    <circle cx="64" cy="44" r="5.5" fill="#7dd3fc" />

    {/* Smile */}
    <path
      d="M 45 48.5 Q 50 56 55 48.5 Z"
      fill="#7dd3fc"
      strokeLinejoin="round"
    />
  </svg>
);

function DocumentPane({
  docData,
  allArticles,
  selectedIds,
  expandedArticleId,
  searchQuery,
  onSelect,
  onToggleArticle,
  onClearSearch,
  isSidebarOpen,
  bookmarkedIds,
  onToggleBookmark,
  userNotes,
  onNoteClick,
}: {
  docData: DocumentData;
  allArticles: Article[];
  selectedIds: string[];
  expandedArticleId: string | null;
  searchQuery: string;
  onSelect: (ids: string | string[], articleId?: string) => void;
  onToggleArticle: (id: string) => void;
  onClearSearch: () => void;
  isSidebarOpen: boolean;
  bookmarkedIds: string[];
  onToggleBookmark: (id: string, title: string) => void;
  userNotes: UserNote[];
  onNoteClick: (text: string, articleId: string, noteId?: string) => void;
}) {
  const isLuat = docData.id === "luat";
  const contentRef = useRef<HTMLDivElement>(null);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const filteredArticles = useMemo(() => {
    if (!deferredSearchQuery.trim()) return [];
    const query = deferredSearchQuery.toLowerCase();
    return allArticles.filter(
      (art) =>
        art.title.toLowerCase().includes(query) ||
        art.content.toLowerCase().includes(query),
    );
  }, [allArticles, deferredSearchQuery]);

  const currentArticles = useMemo(() => {
    if (selectedIds.length === 0) return allArticles;

    const list: Article[] = [];
    selectedIds.forEach((id) => {
      const chapter = docData.chapters.find((ch) => ch.id === id);
      if (chapter) {
        if (chapter.articles) list.push(...chapter.articles);
        if (chapter.sections) {
          chapter.sections.forEach((s) => list.push(...(s.articles || [])));
        }
      } else {
        // Check sections
        for (const ch of docData.chapters) {
          const section = ch.sections?.find((s) => s.id === id);
          if (section && section.articles) {
            list.push(...section.articles);
            break;
          }
        }
      }
    });

    // Remove duplicates if any (though IDs should be unique)
    return Array.from(new Set(list.map((a) => a.id))).map(
      (id) => list.find((a) => a.id === id)!,
    );
  }, [selectedIds, docData, allArticles]);

  const handleToggle = (id: string) => {
    onToggleArticle(id);
    if (expandedArticleId !== id) {
      const query = deferredSearchQuery.trim();
      scrollToElement(
        `${docData.id}-art-${id}`,
        "start",
        1500,
        query ? { type: "search", text: query } : undefined,
      );
    }
  };

  const colorStyles: Record<string, string> = {
    yellow: "bg-[#fef08a] border-[#eab308]",
    green: "bg-[#bbf7d0] border-[#22c55e]",
    blue: "bg-[#bfdbfe] border-[#3b82f6]",
    pink: "bg-[#fbcfe8] border-[#ec4899]",
    purple: "bg-[#e9d5ff] border-[#a855f7]",
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(
      new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"),
    );
    return (
      <span className="whitespace-pre-wrap">
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark
              key={i}
              className="bg-amber-400/40 text-ink-900 border-b-2 border-amber-500 px-0.5 rounded-sm font-black shadow-[0_0_15px_rgba(251,191,36,0.3)]"
            >
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          ),
        )}
      </span>
    );
  };

  const renderContent = (text: string, articleId: string) => {
    const artNotes = userNotes.filter((n) => n.articleId === articleId);
    const formulaText = `n\n\nTỷ lệ sở hữu vốn =   ∑  Xi x Yi\n\ni=1`;

    const formulaRegexGlobal = /\{\{FORMULA_[A-Z0-9_]+\}\}/g;

    if (
      artNotes.length === 0 &&
      !deferredSearchQuery.trim() &&
      !text.includes(formulaText) &&
      !formulaRegexGlobal.test(text) &&
      !/(<sub|<sup)/i.test(text)
    ) {
      return <span data-article-id={articleId}>{text}</span>;
    }

    type Token = {
      type:
        | "text"
        | "note"
        | "search"
        | "formula"
        | "var_subscript"
        | "html_tag"
        | "custom_formula";
      tag?: string;
      extText: string;
      note?: UserNote;
      prefix?: string;
      sub?: string;
      formula_type?: string;
    };
    let tokens: Token[] = [{ type: "text", extText: text }];

    // Handle formula
    if (text.includes(formulaText)) {
      tokens = tokens.flatMap((el) => {
        if (el.type !== "text") return el;
        const parts = el.extText.split(formulaText);
        const newTokens: Token[] = [];
        parts.forEach((part, index) => {
          newTokens.push({ type: "text", extText: part });
          if (index < parts.length - 1) {
            newTokens.push({ type: "formula", extText: formulaText });
          }
        });
        return newTokens;
      });
    }

    const formulaRegex = /(\{\{FORMULA_[A-Z0-9_]+\}\})/g;
    tokens = tokens.flatMap((el) => {
      if (el.type !== "text") return el;
      const parts = el.extText.split(formulaRegex);
      if (parts.length === 1) return [el];
      const newTokens: Token[] = [];
      parts.forEach((part) => {
        if (part.startsWith("{{FORMULA_")) {
          const fType = part.replace("{{FORMULA_", "").replace("}}", "");
          newTokens.push({
            type: "custom_formula" as any,
            extText: part,
            formula_type: fType,
          });
        } else if (part) {
          newTokens.push({ type: "text", extText: part });
        }
      });
      return newTokens;
    });

    const htmlRegex = /(<sub[^>]*>.*?<\/sub>|<sup[^>]*>.*?<\/sup>)/gi;
    tokens = tokens.flatMap((el) => {
      if (el.type !== "text") return el;
      const parts = el.extText.split(htmlRegex);
      if (parts.length === 1) return [el];
      const newTokens: Token[] = [];
      newTokens.push({ type: "text", extText: parts[0] });
      for (let i = 1; i < parts.length; i += 2) {
        const tagMatch = parts[i].match(/<(sub|sup)[^>]*>(.*?)<\/\1>/i);
        if (tagMatch) {
          newTokens.push({
            type: "html_tag" as any,
            extText: tagMatch[2],
            tag: tagMatch[1].toLowerCase(),
          });
        } else {
          newTokens.push({ type: "text", extText: parts[i] });
        }
        newTokens.push({ type: "text", extText: parts[i + 1] });
      }
      return newTokens;
    });

    const varsRegex =
      /(Điểm kỹ thuật|G|Điểm giá|Điểm tổng hợp)_(đang xét|cao nhất|thấp nhất)/gi;
    tokens = tokens.flatMap((el) => {
      if (el.type !== "text") return el;
      const parts = el.extText.split(varsRegex);
      if (parts.length === 1) return [el];
      const newTokens: Token[] = [];
      newTokens.push({ type: "text", extText: parts[0] });
      for (let i = 1; i < parts.length; i += 3) {
        newTokens.push({
          type: "var_subscript",
          extText: "",
          prefix: parts[i],
          sub: parts[i + 1],
        });
        newTokens.push({ type: "text", extText: parts[i + 2] });
      }
      return newTokens;
    });

    artNotes.forEach((note) => {
      if (!note.text.trim()) return;
      const escapeContent = note.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(${escapeContent})`, "g");

      tokens = tokens.flatMap((el) => {
        if (el.type !== "text") return el;
        const parts = el.extText.split(regex);
        return parts.map((part): Token => {
          if (part === note.text) return { type: "note", extText: part, note };
          return { type: "text", extText: part };
        });
      });
    });

    if (deferredSearchQuery.trim()) {
      const escapeQuery = deferredSearchQuery
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const queryRegex = new RegExp(`(${escapeQuery})`, "gi");

      tokens = tokens.flatMap((el) => {
        if (el.type !== "text") return el;
        const parts = el.extText.split(queryRegex);
        return parts.map((part): Token => {
          if (part.toLowerCase() === deferredSearchQuery.trim().toLowerCase())
            return { type: "search", extText: part };
          return { type: "text", extText: part };
        });
      });
    }

    return (
      <span data-article-id={articleId}>
        {tokens.map((el, i) => {
          if (el.type === "note" && el.note) {
            return (
              <mark
                id={`note-${el.note.id}`}
                key={i}
                className={`relative cursor-pointer group ${colorStyles[el.note.color || "yellow"]} text-ink-900 border-l-[3px] rounded-r-sm pr-1 shadow-sm inline my-0.5 leading-relaxed decoration-clone`}
                onClick={(e) => {
                  e.stopPropagation();
                  onNoteClick(el.note!.text, articleId, el.note!.id);
                }}
                data-note-tooltip={el.note.note || ""}
              >
                <span className="italic px-0.5 pointer-events-none">
                  {el.extText}
                </span>
                {!!el.note.note?.trim() && (
                  <span className="inline-flex relative -top-3 -left-1.5 align-top z-10 p-0.5 rounded-full bg-pink-500 text-white shadow-sm ring-2 ring-white hover:scale-110 transition-transform cursor-pointer pointer-events-none">
                    <MessageCircleHeart size={14} />
                  </span>
                )}
              </mark>
            );
          }
          if (el.type === "search") {
            return (
              <mark
                key={i}
                className="bg-amber-400/40 text-ink-900 border-b-2 border-amber-500 px-0.5 rounded-sm font-black shadow-[0_0_15px_rgba(251,191,36,0.3)]"
              >
                {el.extText}
              </mark>
            );
          }
          if (el.type === "formula") {
            return (
              <span
                key={i}
                className="inline-flex items-center justify-center w-full gap-2 my-4 text-[15px] xl:text-[16px]"
              >
                <span>Tỷ lệ sở hữu vốn = </span>
                <span className="flex flex-col items-center">
                  <span className="text-[11px] leading-none text-ink-800 mb-0.5">
                    n
                  </span>
                  <span className="text-[32px] leading-[0.8] font-serif font-light text-ink-900">
                    ∑
                  </span>
                  <span className="text-[11px] leading-none text-ink-800 mt-2">
                    i=1
                  </span>
                </span>
                <span className="ml-1">
                  X<sub className="text-[10px]">i</sub> x Y
                  <sub className="text-[10px]">i</sub>
                </span>
              </span>
            );
          }
          if (el.type === "var_subscript") {
            return (
              <span key={i}>
                {el.prefix}
                <sub className="text-[10px] bottom-0">{el.sub}</sub>
              </span>
            );
          }
          if (el.type === "html_tag") {
            if (el.tag === "sub") {
              return (
                <sub key={i} className="text-[10.5px] font-medium bottom-0">
                  {el.extText}
                </sub>
              );
            }
            if (el.tag === "sup") {
              return (
                <sup key={i} className="text-[10.5px] font-medium top-0">
                  {el.extText}
                </sup>
              );
            }
          }
          if (el.type === "custom_formula") {
            if (el.formula_type === "DIEM_TONG_HOP") {
              return (
                <span
                  key={i}
                  className="flex flex-wrap items-center justify-center w-full gap-2 my-4 text-[14px] xl:text-[15px] overflow-x-auto whitespace-nowrap"
                >
                  <span>
                    Điểm tổng hợp
                    <sub className="text-[9px] bottom-0">đang xét</sub> ={" "}
                  </span>
                  <span className="text-[40px] leading-[0] font-thin mt-[-4px] text-ink-700">
                    (
                  </span>

                  <span className="flex flex-col items-center justify-center mx-1">
                    <span className="border-b border-ink-900 px-2 pb-0.5 mb-0.5">
                      G<sub className="text-[9px] bottom-0">thấp nhất</sub>
                    </span>
                    <span className="px-2 pt-0.5">
                      G<sub className="text-[9px] bottom-0">đang xét</sub>
                    </span>
                  </span>

                  <span> x T + </span>

                  <span className="flex flex-col items-center justify-center mx-1">
                    <span className="border-b border-ink-900 px-4 pb-0.5 mb-0.5">
                      Điểm kỹ thuật
                      <sub className="text-[9px] bottom-0">đang xét</sub>
                    </span>
                    <span className="px-4 pt-0.5">
                      Điểm kỹ thuật
                      <sub className="text-[9px] bottom-0">cao nhất</sub>
                    </span>
                  </span>

                  <span> x K </span>
                  <span className="text-[40px] leading-[0] font-thin mt-[-4px] text-ink-700">
                    )
                  </span>
                  <span> x 100</span>
                </span>
              );
            }

            if (el.formula_type === "DIEM_GIA") {
              return (
                <span
                  key={i}
                  className="flex flex-wrap items-center justify-center w-full gap-2 my-4 text-[14px] xl:text-[15px] overflow-x-auto whitespace-nowrap"
                >
                  <span>
                    Điểm giá<sub className="text-[9px] bottom-0">đang xét</sub>{" "}
                    ={" "}
                  </span>
                  <span className="flex flex-col items-center justify-center mx-1">
                    <span className="border-b border-ink-900 px-4 pb-0.5 mb-0.5">
                      G<sub className="text-[9px] bottom-0">thấp nhất</sub>{" "}
                      <span className="text-[17px] leading-none mb-[-2px] inline-block">
                        &times;
                      </span>{" "}
                      (thang điểm kỹ thuật)
                    </span>
                    <span className="px-4 pt-0.5">
                      G<sub className="text-[9px] bottom-0">đang xét</sub>
                    </span>
                  </span>
                </span>
              );
            }

            if (el.formula_type === "TT42_1A") {
              return (
                <span
                  key={i}
                  className="flex flex-col items-center w-full gap-3 my-5 text-[15px] overflow-x-auto"
                >
                  <span className="flex items-center whitespace-nowrap tracking-wide font-medium">
                    <span>
                      T<sub className="text-[10px] bottom-0 font-bold">tc</sub>
                    </span>
                    <span className="mx-3">=</span>
                    <span className="flex flex-col items-center mr-2">
                      <span className="text-[32px] leading-none font-serif">
                        ∑
                      </span>
                      <span className="text-[10px] mt-1 italic text-ink-600">
                        i
                      </span>
                    </span>
                    <span className="flex items-center gap-1 mx-2">
                      <span className="text-[18px] font-thin text-ink-500">
                        (
                      </span>
                      <span>
                        A
                        <sub className="text-[10px] bottom-0 font-bold">
                          SDi
                        </sub>
                      </span>
                      <span className="mx-1 text-[16px] font-thin">-</span>
                      <span>
                        A
                        <sub className="text-[10px] bottom-0 font-bold">
                          HDi
                        </sub>
                      </span>
                      <span className="text-[18px] font-thin text-ink-500">
                        )
                      </span>
                    </span>
                    <span className="text-[16px] mx-1 leading-[0] mt-[0px] relative">
                      &times;
                    </span>
                    <span className="ml-1 text-[16px]">g</span>
                  </span>
                </span>
              );
            }

            if (el.formula_type === "TT42_1B") {
              return (
                <span
                  key={i}
                  className="flex flex-col items-center w-full gap-3 my-5 text-[15px] overflow-x-auto"
                >
                  <span className="flex items-center whitespace-nowrap tracking-wide font-medium">
                    <span>
                      T<sub className="text-[10px] bottom-0 font-bold">tc</sub>
                    </span>
                    <span className="mx-3">=</span>
                    <span className="flex flex-col items-center mx-1">
                      <span className="text-[32px] leading-none font-serif">
                        ∑
                      </span>
                      <span className="text-[10px] mt-1 italic text-ink-600">
                        i, j
                      </span>
                    </span>
                    <span className="flex items-center gap-1 mx-2">
                      <span className="text-[18px] font-thin text-ink-500">
                        [
                      </span>
                      <span>
                        A
                        <sub className="text-[10px] bottom-0 font-bold">
                          SDij
                        </sub>
                      </span>
                      <span className="mx-1 text-[16px] font-thin">-</span>
                      <span>
                        A
                        <sub className="text-[10px] bottom-0 font-bold">
                          HDij
                        </sub>
                      </span>
                      <span className="text-[18px] font-thin text-ink-500">
                        ]
                      </span>
                    </span>
                    <span className="text-[16px] mx-1 leading-[0] mt-[0px] relative">
                      &times;
                    </span>
                    <span className="ml-1 text-[16px]">
                      g<sub className="text-[10px] bottom-0 font-bold">j</sub>
                    </span>
                  </span>
                </span>
              );
            }

            if (el.formula_type === "TT42_2A_1") {
              return (
                <span
                  key={i}
                  className="flex flex-col items-center w-full gap-3 my-5 text-[15px] overflow-x-auto"
                >
                  <span className="flex items-center whitespace-nowrap tracking-wide font-medium">
                    <span>
                      A<sub className="text-[10px] bottom-0 font-bold">SDi</sub>
                    </span>
                    <span className="mx-3">=</span>
                    <span className="inline-flex items-center text-[15px] mx-[2px] relative top-[-1px]">
                      <span>A</span>
                      <span className="inline-flex flex-col justify-center ml-[1px]">
                        <span className="text-[9px] text-ink-500 font-normal leading-[1] mb-0.5">
                          ktc
                        </span>
                        <span className="text-[10px] font-bold leading-[1] mt-0.5">
                          SDi
                        </span>
                      </span>
                    </span>
                    <span className="mx-3">+</span>
                    <span className="inline-flex items-center text-[15px] mx-[2px] relative top-[-1px]">
                      <span>A</span>
                      <span className="inline-flex flex-col justify-center ml-[1px]">
                        <span className="text-[9px] text-ink-500 font-normal leading-[1] mb-0.5">
                          tc
                        </span>
                        <span className="text-[10px] font-bold leading-[1] mt-0.5">
                          SDi
                        </span>
                      </span>
                    </span>
                    <span className="mx-3">=</span>
                    <span className="flex items-center gap-1">
                      <span className="text-[18px] font-thin text-ink-500">
                        (
                      </span>
                      <span>
                        m<sub className="text-[10px] bottom-0 font-bold">i</sub>{" "}
                        - n
                        <sub className="text-[10px] bottom-0 font-bold">i</sub>
                      </span>
                      <span className="text-[18px] font-thin text-ink-500">
                        )
                      </span>
                    </span>
                    <span className="text-[16px] mx-1 leading-[0] mt-[0px] relative">
                      &times;
                    </span>
                    <span className="flex flex-col items-center mx-1">
                      <span className="border-b border-ink-900 pb-0.5 px-2 mb-0.5">
                        A
                        <sub className="text-[10px] bottom-0 font-bold">
                          HDi
                        </sub>
                      </span>
                      <span className="pt-0.5 px-2">
                        m<sub className="text-[10px] bottom-0 font-bold">i</sub>
                      </span>
                    </span>
                    <span className="mx-3">+</span>
                    <span className="flex flex-col items-center mx-1">
                      <span className="border-b border-ink-900 pb-0.5 px-2 mb-0.5 flex items-center">
                        <span>
                          n
                          <sub className="text-[10px] bottom-0 font-bold">
                            i
                          </sub>
                        </span>
                        <span className="text-[14px] mx-1">&times;</span>
                        <span>
                          A
                          <sub className="text-[10px] bottom-0 font-bold">
                            HDi
                          </sub>
                        </span>
                      </span>
                      <span className="pt-0.5 px-2 flex items-center">
                        <span className="text-[18px] font-thin text-ink-500 mr-0.5">
                          (
                        </span>
                        <span>100% - s</span>
                        <span className="text-[18px] font-thin text-ink-500 ml-0.5">
                          )
                        </span>
                        <span className="text-[14px] mx-1">&times;</span>
                        <span>
                          m
                          <sub className="text-[10px] bottom-0 font-bold">
                            i
                          </sub>
                        </span>
                      </span>
                    </span>
                  </span>
                </span>
              );
            }

            if (el.formula_type === "TT42_2B_1") {
              return (
                <span
                  key={i}
                  className="flex flex-col items-center w-full gap-3 my-5 text-[15px] overflow-x-auto"
                >
                  <span className="flex items-center whitespace-nowrap tracking-wide font-medium">
                    <span>
                      A<sub className="text-[10px] bottom-0 font-bold">SDi</sub>
                    </span>
                    <span className="mx-3">=</span>
                    <span className="inline-flex items-center text-[15px] mx-[2px] relative top-[-1px]">
                      <span>A</span>
                      <span className="inline-flex flex-col justify-center ml-[1px]">
                        <span className="text-[9px] text-ink-500 font-normal leading-[1] mb-0.5">
                          ktc
                        </span>
                        <span className="text-[10px] font-bold leading-[1] mt-0.5">
                          SDi
                        </span>
                      </span>
                    </span>
                    <span className="mx-3">+</span>
                    <span className="inline-flex items-center text-[15px] mx-[2px] relative top-[-1px]">
                      <span>A</span>
                      <span className="inline-flex flex-col justify-center ml-[1px]">
                        <span className="text-[9px] text-ink-500 font-normal leading-[1] mb-0.5">
                          tc
                        </span>
                        <span className="text-[10px] font-bold leading-[1] mt-0.5">
                          SDi
                        </span>
                      </span>
                    </span>
                    <span className="mx-3">=</span>
                    <span className="flex items-center gap-1">
                      <span className="text-[18px] font-thin text-ink-500">
                        (
                      </span>
                      <span>
                        m<sub className="text-[10px] bottom-0 font-bold">i</sub>{" "}
                        - n
                        <sub className="text-[10px] bottom-0 font-bold">i</sub>
                      </span>
                      <span className="text-[18px] font-thin text-ink-500">
                        )
                      </span>
                    </span>
                    <span className="text-[16px] mx-1 leading-[0] mt-[0px] relative">
                      &times;
                    </span>
                    <span className="flex flex-col items-center mx-1">
                      <span className="border-b border-ink-900 pb-0.5 px-2 mb-0.5">
                        A
                        <sub className="text-[10px] bottom-0 font-bold">
                          HDi
                        </sub>
                      </span>
                      <span className="pt-0.5 px-2">
                        m<sub className="text-[10px] bottom-0 font-bold">i</sub>
                      </span>
                    </span>
                    <span className="mx-3">+</span>
                    <span className="inline-flex items-center text-[15px] mx-[2px] relative top-[-1px]">
                      <span>A</span>
                      <span className="inline-flex flex-col justify-center ml-[1px]">
                        <span className="text-[9px] text-ink-500 font-normal leading-[1] mb-0.5">
                          tc
                        </span>
                        <span className="text-[10px] font-bold leading-[1] mt-0.5">
                          SDi
                        </span>
                      </span>
                    </span>
                  </span>
                </span>
              );
            }

            if (el.formula_type === "TT42_2B_2") {
              return (
                <span
                  key={i}
                  className="flex flex-col items-center w-full gap-3 my-5 text-[15px] overflow-x-auto"
                >
                  <span className="flex items-center whitespace-nowrap tracking-wide font-medium">
                    <span className="inline-flex items-center text-[15px] mx-[2px] relative top-[-1px]">
                      <span>A</span>
                      <span className="inline-flex flex-col justify-center ml-[1px]">
                        <span className="text-[9px] text-ink-500 font-normal leading-[1] mb-0.5">
                          ktc
                        </span>
                        <span className="text-[10px] font-bold leading-[1] mt-0.5">
                          SDi
                        </span>
                      </span>
                    </span>
                    <span className="mx-3">=</span>
                    <span className="flex items-center gap-1">
                      <span className="text-[18px] font-thin text-ink-500">
                        (
                      </span>
                      <span>
                        m<sub className="text-[10px] bottom-0 font-bold">i</sub>{" "}
                        - n
                        <sub className="text-[10px] bottom-0 font-bold">i</sub>
                      </span>
                      <span className="text-[18px] font-thin text-ink-500">
                        )
                      </span>
                    </span>
                    <span className="text-[16px] mx-1 leading-[0] mt-[0px] relative">
                      &times;
                    </span>
                    <span className="flex flex-col items-center mx-1">
                      <span className="border-b border-ink-900 pb-0.5 px-2 mb-0.5">
                        A
                        <sub className="text-[10px] bottom-0 font-bold">
                          HDi
                        </sub>
                      </span>
                      <span className="pt-0.5 px-2">
                        m<sub className="text-[10px] bottom-0 font-bold">i</sub>
                      </span>
                    </span>
                  </span>
                </span>
              );
            }

            if (el.formula_type === "TT42_2C_1") {
              return (
                <span
                  key={i}
                  className="flex flex-col items-center w-full gap-3 my-5 text-[15px] overflow-x-auto"
                >
                  <span className="flex items-center whitespace-nowrap tracking-wide font-medium">
                    <span className="inline-flex items-center text-[15px] mx-[2px] relative top-[-1px]">
                      <span>A</span>
                      <span className="inline-flex flex-col justify-center ml-[1px]">
                        <span className="text-[9px] text-ink-500 font-normal leading-[1] mb-0.5">
                          tc
                        </span>
                        <span className="text-[10px] font-bold leading-[1] mt-0.5">
                          SDi
                        </span>
                      </span>
                    </span>
                    <span className="mx-3">=</span>
                    <span>P</span>
                    <span className="text-[16px] mx-2 leading-[0] mt-[0px] relative">
                      &times;
                    </span>
                    <span>
                      t<sub className="text-[10px] bottom-0 font-bold">tb</sub>
                    </span>
                    <span className="text-[16px] mx-2 leading-[0] mt-[0px] relative">
                      &times;
                    </span>
                    <span>
                      n<sub className="text-[10px] bottom-0 font-bold">i</sub>
                    </span>
                  </span>
                </span>
              );
            }

            if (el.formula_type === "TT42_2C_2") {
              return (
                <span
                  key={i}
                  className="flex flex-col items-center w-full gap-3 my-5 text-[15px] overflow-x-auto"
                >
                  <span className="flex items-center whitespace-nowrap tracking-wide font-medium">
                    <span className="inline-flex items-center text-[15px] mx-[2px] relative top-[-1px]">
                      <span>A</span>
                      <span className="inline-flex flex-col justify-center ml-[1px]">
                        <span className="text-[9px] text-ink-500 font-normal leading-[1] mb-0.5">
                          tc
                        </span>
                        <span className="text-[10px] font-bold leading-[1] mt-0.5">
                          SDi
                        </span>
                      </span>
                    </span>
                    <span className="mx-3">=</span>
                    <span className="text-[18px] font-thin text-ink-500 mr-2">
                      (
                    </span>
                    <span>
                      P<sub className="text-[10px] bottom-0 font-bold">1</sub>{" "}
                      &times; t
                      <sub className="text-[10px] bottom-0 font-bold">1</sub>
                    </span>
                    <span className="mx-2 text-[16px] font-thin">+</span>
                    <span>
                      P<sub className="text-[10px] bottom-0 font-bold">2</sub>{" "}
                      &times; t
                      <sub className="text-[10px] bottom-0 font-bold">2</sub>
                    </span>
                    <span className="mx-2 text-[16px] font-thin">+</span>
                    <span className="font-serif italic mx-1 -mt-1 font-bold">
                      ...
                    </span>
                    <span className="mx-2 text-[16px] font-thin">+</span>
                    <span>
                      P<sub className="text-[10px] bottom-0 font-bold">k</sub>{" "}
                      &times; t
                      <sub className="text-[10px] bottom-0 font-bold">k</sub>
                    </span>
                    <span className="text-[18px] font-thin text-ink-500 ml-2">
                      )
                    </span>
                    <span className="text-[16px] mx-2 leading-[0] mt-[0px] relative">
                      &times;
                    </span>
                    <span>
                      n<sub className="text-[10px] bottom-0 font-bold">i</sub>
                    </span>
                  </span>
                </span>
              );
            }

            if (el.formula_type === "TT42_3B") {
              return (
                <span
                  key={i}
                  className="flex flex-col items-center w-full gap-3 my-5 text-[15px] overflow-x-auto"
                >
                  <span className="flex items-center whitespace-nowrap tracking-wide font-medium">
                    <span className="text-[32px] leading-none font-serif mr-1">
                      ∑
                    </span>
                    <span>
                      n
                      <sub className="text-[10px] bottom-0 font-bold pl-[0.5px]">
                        i
                      </sub>
                    </span>
                    <span className="mx-3">=</span>
                    <span>n</span>
                  </span>
                </span>
              );
            }

            if (el.formula_type === "A_KTC_SDI") {
              return (
                <span
                  key={i}
                  className="inline-flex items-center text-[15px] mx-[2px] relative top-[-1px]"
                >
                  <span>A</span>
                  <span className="inline-flex flex-col justify-center ml-[1px]">
                    <span className="text-[9px] text-ink-500 font-normal leading-[1] mb-0.5">
                      ktc
                    </span>
                    <span className="text-[10px] font-bold leading-[1] mt-0.5">
                      SDi
                    </span>
                  </span>
                </span>
              );
            }

            if (el.formula_type === "A_TC_SDI") {
              return (
                <span
                  key={i}
                  className="inline-flex items-center text-[15px] mx-[2px] relative top-[-1px]"
                >
                  <span>A</span>
                  <span className="inline-flex flex-col justify-center ml-[1px]">
                    <span className="text-[9px] text-ink-500 font-normal leading-[1] mb-0.5">
                      tc
                    </span>
                    <span className="text-[10px] font-bold leading-[1] mt-0.5">
                      SDi
                    </span>
                  </span>
                </span>
              );
            }

            if (el.formula_type === "ND18_1") {
              return (
                <span
                  key={i}
                  className="flex flex-col items-center w-full gap-3 my-5 text-[15px] overflow-x-auto"
                >
                  <span className="flex items-center whitespace-nowrap tracking-wide font-medium">
                    <span>
                      cos<span className="font-serif italic pl-[1px]">φ</span>
                    </span>
                    <span className="mx-3">=</span>
                    <span className="flex flex-col items-center">
                      <span className="border-b border-ink-900 pb-0.5 px-3 mb-0.5">
                        A
                        <sub className="text-[10px] bottom-0 font-bold pl-[1px]">
                          p
                        </sub>
                      </span>
                      <span className="pt-0.5 px-3 flex items-center">
                        <span className="text-[18px] font-serif leading-none mt-[-2px] pr-1">
                          √
                        </span>
                        <span className="border-t border-ink-900 pt-[2px]">
                          A
                          <sub className="text-[10px] bottom-0 font-bold pl-[1px] pr-[1px]">
                            p
                          </sub>
                          <sup className="text-[10px] top-[-2px]">2</sup> + A
                          <sub className="text-[10px] bottom-0 font-bold pl-[1px] pr-[1px]">
                            q
                          </sub>
                          <sup className="text-[10px] top-[-2px]">2</sup>
                        </span>
                      </span>
                    </span>
                  </span>
                </span>
              );
            }

            if (el.formula_type === "ND18_2") {
              return (
                <span
                  key={i}
                  className="flex flex-col items-center w-full gap-3 my-5 text-[15px] overflow-x-auto"
                >
                  <span className="flex items-center whitespace-nowrap tracking-wide font-medium">
                    <span>
                      T
                      <sub className="text-[10px] bottom-0 font-bold pl-[1px]">
                        q
                      </sub>
                    </span>
                    <span className="mx-3">=</span>
                    <span>
                      T
                      <sub className="text-[10px] bottom-0 font-bold pl-[1px] pr-1">
                        p
                      </sub>
                    </span>
                    <span className="text-[16px] mx-1 leading-[0] mt-[0px] relative">
                      &times;
                    </span>
                    <span>
                      k<span className="font-serif ml-0.5">%</span>
                    </span>
                  </span>
                </span>
              );
            }

            if (el.formula_type === "TABLE_LUAT_GIA") {
              return (
                <span
                  key={i}
                  className="block w-full overflow-x-auto my-6 border border-ink-900/10 rounded-lg"
                >
                  <table className="w-full text-left border-collapse text-[13px] bg-white">
                    <tbody className="divide-y divide-ink-900/10">
                      <tr>
                        <td className="px-4 py-3 align-top font-bold border-r border-ink-900/10 w-[40px] text-center">
                          2
                        </td>
                        <td className="px-4 py-3 align-top border-r border-ink-900/10">
                          Dịch vụ vận chuyển khí thiên nhiên bằng đường ống và
                          dịch vụ tồn trữ, tái hóa, vận chuyển và phân phối khí
                          thiên nhiên hóa lỏng cho sản xuất điện
                        </td>
                        <td className="px-4 py-3 align-top">
                          Bộ Công Thương định giá cụ thể
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </span>
              );
            }

            if (el.formula_type === "TABLE_TT42_PL2") {
              return (
                <span
                  key={i}
                  className="block w-full overflow-x-auto my-6 border border-ink-900/10 rounded-lg"
                >
                  <table className="w-full text-left border-collapse text-[13px] bg-white">
                    <thead>
                      <tr className="bg-ink-900/5">
                        <th
                          rowSpan={2}
                          className="px-4 py-3 font-semibold border-b border-r border-ink-900/10 text-center w-[50px]"
                        >
                          STT
                        </th>
                        <th
                          rowSpan={2}
                          className="px-4 py-3 font-semibold border-b border-r border-ink-900/10 min-w-[200px]"
                        >
                          Phân loại thiết bị tiêu thụ điện
                        </th>
                        <th
                          colSpan={6}
                          className="px-4 py-3 font-semibold border-b border-ink-900/10 text-center"
                        >
                          Thời gian sử dụng của thiết bị điện trong từng loại
                          hình phụ tải (giờ/ ngày)
                        </th>
                      </tr>
                      <tr className="bg-ink-900/5">
                        <th className="px-3 py-2 font-semibold border-b border-r border-ink-900/10 text-center">
                          Sinh hoạt gia đình
                        </th>
                        <th className="px-3 py-2 font-semibold border-b border-r border-ink-900/10 text-center">
                          Kinh doanh dịch vụ
                        </th>
                        <th className="px-3 py-2 font-semibold border-b border-r border-ink-900/10 text-center">
                          Cơ quan hành chính
                        </th>
                        <th className="px-3 py-2 font-semibold border-b border-r border-ink-900/10 text-center">
                          Sản xuất 1 ca
                        </th>
                        <th className="px-3 py-2 font-semibold border-b border-r border-ink-900/10 text-center">
                          Sản xuất 2 ca
                        </th>
                        <th className="px-3 py-2 font-semibold border-b border-ink-900/10 text-center">
                          Sản xuất 3 ca
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-900/10">
                      <tr className="hover:bg-ink-900/5 transition-colors">
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          1
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          Thiết bị chiếu sáng
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          6
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          16
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          8
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          8
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          16
                        </td>
                        <td className="px-4 py-2 text-center">24</td>
                      </tr>
                      <tr className="hover:bg-ink-900/5 transition-colors">
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          2
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          Thiết bị tạo và thông gió
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          10
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          12
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          8
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          8
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          16
                        </td>
                        <td className="px-4 py-2 text-center">24</td>
                      </tr>
                      <tr className="hover:bg-ink-900/5 transition-colors">
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          3
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          Thiết bị lạnh
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          24
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          24
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          20
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          20
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          22
                        </td>
                        <td className="px-4 py-2 text-center">24</td>
                      </tr>
                      <tr className="hover:bg-ink-900/5 transition-colors">
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          4
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          Điều hòa không khí
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          8
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          16
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          8
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          8
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          16
                        </td>
                        <td className="px-4 py-2 text-center">24</td>
                      </tr>
                      <tr className="hover:bg-ink-900/5 transition-colors">
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          5
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          Đồ dùng điện tử dân dụng
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          6
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          12
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          6
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center"></td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center"></td>
                        <td className="px-4 py-2 text-center"></td>
                      </tr>
                      <tr className="hover:bg-ink-900/5 transition-colors">
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          6
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          Thiết bị gia nhiệt dân dụng
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          2
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          8
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          4
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center"></td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center"></td>
                        <td className="px-4 py-2 text-center"></td>
                      </tr>
                      <tr className="hover:bg-ink-900/5 transition-colors">
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          7
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          Thiết bị có động cơ điện
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          4
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          8
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          6
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          8
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          14
                        </td>
                        <td className="px-4 py-2 text-center">22</td>
                      </tr>
                      <tr className="hover:bg-ink-900/5 transition-colors">
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          8
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          Máy hàn điện
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          4
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          10
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          6
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          8
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          16
                        </td>
                        <td className="px-4 py-2 text-center">20</td>
                      </tr>
                      <tr className="hover:bg-ink-900/5 transition-colors">
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          9
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          Thiết bị thông tin liên lạc
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          8
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          12
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          14
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center"></td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center"></td>
                        <td className="px-4 py-2 text-center"></td>
                      </tr>
                      <tr className="hover:bg-ink-900/5 transition-colors">
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          10
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          Thiết bị nạp điện
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          8
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          12
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center"></td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          8
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10 text-center">
                          16
                        </td>
                        <td className="px-4 py-2 text-center">24</td>
                      </tr>
                      <tr className="bg-ink-900/5 transition-colors">
                        <td
                          className="px-4 py-3 border-r border-ink-900/10 text-center font-semibold"
                          colSpan={2}
                        >
                          Thời gian sử dụng bình quân của các thiết bị điện (t
                          <sub>tb</sub>), (giờ/ ngày)
                        </td>
                        <td className="px-4 py-3 border-r border-ink-900/10 text-center font-bold">
                          6
                        </td>
                        <td className="px-4 py-3 border-r border-ink-900/10 text-center font-bold">
                          12
                        </td>
                        <td className="px-4 py-3 border-r border-ink-900/10 text-center font-bold">
                          8
                        </td>
                        <td className="px-4 py-3 border-r border-ink-900/10 text-center font-bold">
                          8
                        </td>
                        <td className="px-4 py-3 border-r border-ink-900/10 text-center font-bold">
                          16
                        </td>
                        <td className="px-4 py-3 text-center font-bold">24</td>
                      </tr>
                    </tbody>
                  </table>
                </span>
              );
            }

            if (el.formula_type === "TABLE_ND18") {
              return (
                <span
                  key={i}
                  className="block w-full overflow-x-auto my-6 border border-ink-900/10 rounded-lg"
                >
                  <table className="w-full text-left border-collapse text-[13px] bg-white">
                    <thead>
                      <tr className="bg-ink-900/5">
                        <th className="px-4 py-3 font-semibold border-b border-r border-ink-900/10">
                          Hệ số công suất cosφ
                        </th>
                        <th className="px-4 py-3 font-semibold border-b border-r border-ink-900/10">
                          k (%)
                        </th>
                        <th className="px-4 py-3 font-semibold border-b border-r border-ink-900/10">
                          Hệ số công suất cosφ
                        </th>
                        <th className="px-4 py-3 font-semibold border-b border-ink-900/10">
                          k (%)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-900/10">
                      <tr>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          Từ 0,9 trở lên
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          0
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          0,74
                        </td>
                        <td className="px-4 py-2">21,62</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          0,89
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          1,12
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          0,73
                        </td>
                        <td className="px-4 py-2">23,29</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          0,88
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          2,27
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          0,72
                        </td>
                        <td className="px-4 py-2">25,00</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          0,87
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          3,45
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          0,71
                        </td>
                        <td className="px-4 py-2">26,76</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          0,86
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          4,65
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          0,70
                        </td>
                        <td className="px-4 py-2">28,57</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          0,85
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          5,88
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          0,69
                        </td>
                        <td className="px-4 py-2">30,43</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          0,84
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          7,14
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          0,68
                        </td>
                        <td className="px-4 py-2">32,35</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          0,83
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          8,43
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          0,67
                        </td>
                        <td className="px-4 py-2">34,33</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          0,82
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          9,76
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          0,66
                        </td>
                        <td className="px-4 py-2">36,36</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          0,81
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          11,11
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          0,65
                        </td>
                        <td className="px-4 py-2">38,46</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          0,80
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          12,50
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          0,64
                        </td>
                        <td className="px-4 py-2">40,63</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          0,79
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          13,92
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          0,63
                        </td>
                        <td className="px-4 py-2">42,86</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          0,78
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          15,38
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          0,62
                        </td>
                        <td className="px-4 py-2">45,16</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          0,77
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          16,88
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          0,61
                        </td>
                        <td className="px-4 py-2">47,54</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          0,76
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          18,42
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          0,60
                        </td>
                        <td className="px-4 py-2">50,00</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          0,75
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          20,00
                        </td>
                        <td className="px-4 py-2 border-r border-ink-900/10">
                          Dưới 0,60
                        </td>
                        <td className="px-4 py-2">52,54</td>
                      </tr>
                    </tbody>
                  </table>
                </span>
              );
            }
          }
          return <span key={i}>{el.extText}</span>;
        })}
      </span>
    );
  };

  return (
    <div
      ref={contentRef}
      className="flex-1 overflow-y-auto p-4 lg:px-6 lg:pt-0 lg:pb-12 h-full bg-transparent flex justify-center"
    >
      <div
        className={`w-full max-w-4xl h-full pt-0 pb-20 mt-4 flex flex-col transition-all duration-500 ease-in-out`}
      >
        <div className="w-full">
          {searchQuery.trim() ? (
            /* Search Results */
            <div className="space-y-0">
              {filteredArticles.length > 0 ? (
                <div className="space-y-0">
                  {filteredArticles.map((art) => {
                    // Find where this article belongs
                    let parentId = "";
                    docData.chapters.forEach((ch) => {
                      if (ch.articles?.find((a) => a.id === art.id))
                        parentId = ch.id;
                      ch.sections?.forEach((s) => {
                        if (s.articles.find((a) => a.id === art.id))
                          parentId = s.id;
                      });
                    });

                    return (
                      <div
                        key={art.id}
                        id={`${docData.id}-art-${art.id}`}
                        className="bg-white rounded-xl border border-ink-900/5 shadow-sm hover:shadow-md transition-all duration-300 overflow-visible mb-4 last:mb-0 scroll-mt-0"
                      >
                        <div
                          onClick={() => handleToggle(art.id)}
                          className={`w-full text-left cursor-pointer p-3 lg:p-4 flex items-center justify-between gap-4 transition-colors ${expandedArticleId === art.id ? "bg-yellow-400 text-slate-900 sticky top-0 z-20 shadow-md shadow-yellow-400/20 rounded-t-xl rounded-b-none" : "hover:bg-cream-50 rounded-xl"}`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`font-bold px-2 py-0.5 border rounded-md transition-all shrink-0 whitespace-nowrap ${expandedArticleId === art.id ? "border-slate-900/50 bg-yellow-400 text-slate-900 shadow-sm" : "border-slate-200 text-ink-800"} text-xs lg:text-sm tracking-tight`}
                            >
                              {art.id.includes("PHỤ LỤC")
                                ? "PHỤ LỤC"
                                : art.id.includes("-PL-")
                                  ? `PHỤ LỤC ${art.id.split("-PL-")[1]}`
                                  : art.id.includes("-empty")
                                    ? "Nội dung"
                                    : `Điều ${art.id.split("D")[1]}`}
                            </div>
                            <h2
                              className={`font-bold text-xs lg:text-sm tracking-tight ${expandedArticleId === art.id ? "text-slate-900" : "text-ink-900"} leading-snug line-clamp-2`}
                            >
                              {highlightMatch(
                                art.title.split(".")[1]?.trim() || art.title,
                                searchQuery,
                              )}
                            </h2>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleBookmark(art.id, art.title);
                              }}
                              className={`p-1.5 rounded-full hover:bg-black/10 transition-colors ${bookmarkedIds.includes(art.id) ? (expandedArticleId === art.id ? "text-rose-600" : "text-rose-500") : expandedArticleId === art.id ? "text-slate-900/60 hover:text-slate-900" : "text-slate-300 hover:text-slate-500"}`}
                            >
                              <Bookmark
                                size={16}
                                fill={
                                  bookmarkedIds.includes(art.id)
                                    ? "currentColor"
                                    : "none"
                                }
                              />
                            </button>
                            <ChevronDown
                              size={20}
                              className={`transition-transform duration-300 shrink-0 ${expandedArticleId === art.id ? "rotate-180 text-slate-900" : "text-slate-300"}`}
                            />
                          </div>
                        </div>

                        {expandedArticleId === art.id ? (
                          <div className="overflow-hidden">
                            <div className="px-5 lg:px-6 pb-6 pt-3 border-t border-ink-900/5">
                              <div className="pr-2">
                                <p className="text-ink-800 leading-relaxed text-[12px] lg:text-[13px] whitespace-pre-wrap font-sans selection:bg-deep-yellow/30 text-justify">
                                  {renderContent(art.content, art.id)}
                                </p>
                              </div>
                              <div className="mt-4 pt-4 border-t border-ink-900/5 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-deep-yellow-dark/60 text-[9px] font-black uppercase tracking-[0.2em]">
                                  <Info size={12} />
                                  TRÍCH {docData.title.toUpperCase()}
                                </div>
                                <button
                                  onClick={() => {
                                    onSelect(parentId, art.id);
                                    onClearSearch();
                                  }}
                                  className="text-amber-700 hover:text-amber-900 text-[10px] font-bold underline decoration-dotted underline-offset-4"
                                >
                                  Xem trong chương mục gốc
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="px-5 lg:px-8 pb-6 pt-0">
                            <div className="text-slate-500 text-xs leading-relaxed line-clamp-2 italic border-l-2 border-slate-100 pl-4 py-1 text-justify">
                              {(() => {
                                const content = art.content;
                                const query = deferredSearchQuery.toLowerCase();
                                const index = content
                                  .toLowerCase()
                                  .indexOf(query);
                                if (index === -1)
                                  return renderContent(
                                    content.substring(0, 250) +
                                      (content.length > 250 ? "..." : ""),
                                    art.id,
                                  );
                                const start = Math.max(0, index - 80);
                                const end = Math.min(
                                  content.length,
                                  index + 150,
                                );
                                let snippet = content.substring(start, end);
                                if (start > 0) snippet = "..." + snippet;
                                if (end < content.length)
                                  snippet = snippet + "...";
                                return renderContent(snippet, art.id);
                              })()}
                            </div>
                            <button
                              onClick={() => handleToggle(art.id)}
                              className="mt-3 text-[10px] font-bold text-deep-yellow-dark flex items-center gap-1 hover:gap-2 transition-all uppercase tracking-widest"
                            >
                              Xem toàn bộ nội dung <ChevronRight size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <Search size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">
                    Không tìm thấy kết quả
                  </h3>
                  <p className="text-slate-500 mt-1">Hãy thử từ khóa khác.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-0">
              {currentArticles.length > 0 ? (
                <div className="space-y-6">
                  {docData.chapters.map((chapter) => {
                    const hasMatchingArticles = currentArticles.some(
                      (ca) =>
                        chapter.articles?.some((a) => a.id === ca.id) ||
                        chapter.sections?.some((s) =>
                          s.articles.some((sa) => sa.id === ca.id),
                        ),
                    );
                    if (!hasMatchingArticles) return null;

                    return (
                      <div key={chapter.id} className="relative">
                        <div
                          id={`${docData.id}-chapter-${chapter.id}`}
                          className="scroll-mt-0 sticky top-0 z-30 bg-slate-50/95 backdrop-blur-md h-[34px] mb-3 rounded-lg px-3 border border-slate-200/40 flex items-center justify-between"
                        >
                          <h3
                            className="font-semibold text-slate-500 text-[11px] lg:text-xs uppercase tracking-wider leading-snug line-clamp-1"
                            title={chapter.title}
                          >
                            {chapter.title}
                          </h3>
                        </div>

                        {/* Render direct articles of the chapter first */}
                        {chapter.articles?.some(
                          (a) =>
                            !a.id.includes("-empty") &&
                            currentArticles.some((ca) => ca.id === a.id),
                        ) && (
                          <div className="space-y-4 mb-6 px-1 lg:px-2">
                            {chapter.articles
                              .filter(
                                (a) =>
                                  !a.id.includes("-empty") &&
                                  currentArticles.some((ca) => ca.id === a.id),
                              )
                              .map((art) => (
                                <div
                                  key={art.id}
                                  id={`${docData.id}-art-${art.id}`}
                                  className="scroll-mt-[34px] bg-white rounded-xl border border-ink-900/5 shadow-sm hover:shadow-md transition-all duration-300 overflow-visible mb-4 last:mb-0"
                                >
                                  <div
                                    onClick={() => handleToggle(art.id)}
                                    className={`w-full text-left cursor-pointer p-2.5 lg:py-3 lg:px-4 flex items-center justify-between gap-3 transition-colors ${expandedArticleId === art.id ? "bg-yellow-400 text-slate-900 sticky top-[34px] z-20 shadow-md shadow-yellow-400/20 rounded-t-xl rounded-b-none" : "hover:bg-cream-50 rounded-xl"}`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div
                                        className={`font-bold px-2 py-0.5 border rounded-md transition-all shrink-0 whitespace-nowrap ${expandedArticleId === art.id ? "border-slate-900/50 bg-yellow-400 text-slate-900 shadow-sm" : "border-slate-200 text-ink-800"} text-xs lg:text-sm tracking-tight`}
                                      >
                                        {art.id.includes("PHỤ LỤC")
                                          ? "PHỤ LỤC"
                                          : art.id.includes("-PL-")
                                            ? `PHỤ LỤC ${art.id.split("-PL-")[1]}`
                                            : art.id.includes("-empty")
                                              ? "Nội dung"
                                              : `Điều ${art.id.split("D")[1]}`}
                                      </div>
                                      <h2
                                        className={`font-bold text-xs lg:text-sm tracking-tight ${expandedArticleId === art.id ? "text-slate-900" : "text-ink-900"} line-clamp-2 leading-snug`}
                                      >
                                        {art.title.split(".")[1]?.trim() ||
                                          art.title}
                                      </h2>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onToggleBookmark(art.id, art.title);
                                        }}
                                        className={`p-1.5 rounded-full hover:bg-black/10 transition-colors ${bookmarkedIds.includes(art.id) ? (expandedArticleId === art.id ? "text-rose-600" : "text-rose-500") : expandedArticleId === art.id ? "text-slate-900/60 hover:text-slate-900" : "text-slate-300 hover:text-slate-500"}`}
                                      >
                                        <Bookmark
                                          size={16}
                                          fill={
                                            bookmarkedIds.includes(art.id)
                                              ? "currentColor"
                                              : "none"
                                          }
                                        />
                                      </button>
                                      <ChevronDown
                                        size={18}
                                        className={`transition-transform duration-300 shrink-0 ${expandedArticleId === art.id ? "rotate-180 text-slate-900" : "text-slate-400"}`}
                                      />
                                    </div>
                                  </div>

                                  {expandedArticleId === art.id && (
                                    <div className="overflow-hidden animate-in fade-in duration-150 ease-out">
                                      <div className="px-4 lg:px-5 pb-5 pt-3 border-t border-ink-900/5">
                                        <div className="pr-2">
                                          <p className="text-ink-800 leading-relaxed text-[12px] lg:text-[13px] whitespace-pre-wrap font-sans selection:bg-deep-yellow/30 text-justify">
                                            {renderContent(art.content, art.id)}
                                          </p>
                                        </div>
                                        <div className="mt-6 pt-5 border-t border-ink-900/5 flex items-center justify-between">
                                          <div className="flex items-center gap-2 text-deep-yellow-dark/60 text-[9px] font-black uppercase tracking-[0.2em]">
                                            <Info size={14} />
                                            TRÍCH {docData.title.toUpperCase()}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        )}

                        {/* Render Sections */}
                        {chapter.sections?.map((section) => {
                          const hasMatchingSectionArticles =
                            section.articles.some(
                              (a) =>
                                !a.id.includes("-empty") &&
                                currentArticles.some((ca) => ca.id === a.id),
                            );
                          if (!hasMatchingSectionArticles) return null;

                          return (
                            <div
                              key={section.id}
                              id={`${docData.id}-section-${section.id}`}
                              className="scroll-mt-[34px] mb-6 px-1 lg:px-3"
                            >
                              <div className="flex flex-col gap-1 mb-3 pl-2.5 border-l-[1.5px] border-deep-yellow/70 sticky top-[34px] z-20 bg-slate-900 py-2">
                                <h4
                                  className="font-semibold text-slate-500 text-[10px] lg:text-[11px] uppercase tracking-wider line-clamp-1"
                                  title={section.title}
                                >
                                  {section.title}
                                </h4>
                              </div>

                              <div className="space-y-4 pl-0 lg:pl-2">
                                {section.articles
                                  .filter(
                                    (a) =>
                                      !a.id.includes("-empty") &&
                                      currentArticles.some(
                                        (ca) => ca.id === a.id,
                                      ),
                                  )
                                  .map((art) => (
                                    <div
                                      key={art.id}
                                      id={`${docData.id}-art-${art.id}`}
                                      className="scroll-mt-[64px] bg-white rounded-xl border border-ink-900/5 shadow-sm hover:shadow-md transition-all duration-300 overflow-visible mb-4 last:mb-0"
                                    >
                                      <div
                                        onClick={() => handleToggle(art.id)}
                                        className={`w-full text-left cursor-pointer p-2.5 lg:py-3 lg:px-4 flex items-center justify-between gap-3 transition-colors ${expandedArticleId === art.id ? "bg-yellow-400 text-slate-900 sticky top-[64px] z-20 shadow-md shadow-yellow-400/20 rounded-t-xl rounded-b-none" : "hover:bg-cream-50 rounded-xl"}`}
                                      >
                                        <div className="flex items-center gap-3">
                                          <div
                                            className={`font-bold px-2 py-0.5 border rounded-md transition-all shrink-0 whitespace-nowrap ${expandedArticleId === art.id ? "border-slate-900/50 bg-yellow-400 text-slate-900 shadow-sm" : "border-slate-200 text-ink-800"} text-xs lg:text-sm tracking-tight`}
                                          >
                                            {art.id.includes("PHỤ LỤC")
                                              ? "PHỤ LỤC"
                                              : art.id.includes("-PL-")
                                                ? `PHỤ LỤC ${art.id.split("-PL-")[1]}`
                                                : art.id.includes("-empty")
                                                  ? "Nội dung"
                                                  : `Điều ${art.id.split("D")[1]}`}
                                          </div>
                                          <h2
                                            className={`font-bold text-xs lg:text-sm tracking-tight ${expandedArticleId === art.id ? "text-slate-900" : "text-ink-900"} line-clamp-2 leading-snug`}
                                          >
                                            {art.title.split(".")[1]?.trim() ||
                                              art.title}
                                          </h2>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              onToggleBookmark(
                                                art.id,
                                                art.title,
                                              );
                                            }}
                                            className={`p-1.5 rounded-full hover:bg-black/10 transition-colors ${bookmarkedIds.includes(art.id) ? (expandedArticleId === art.id ? "text-rose-600" : "text-rose-500") : expandedArticleId === art.id ? "text-slate-900/60 hover:text-slate-900" : "text-slate-300 hover:text-slate-500"}`}
                                          >
                                            <Bookmark
                                              size={16}
                                              fill={
                                                bookmarkedIds.includes(art.id)
                                                  ? "currentColor"
                                                  : "none"
                                              }
                                            />
                                          </button>
                                          <ChevronDown
                                            size={18}
                                            className={`transition-transform duration-300 shrink-0 ${expandedArticleId === art.id ? "rotate-180 text-slate-900" : "text-slate-400"}`}
                                          />
                                        </div>
                                      </div>

                                      {expandedArticleId === art.id && (
                                        <div className="overflow-hidden animate-in fade-in duration-150 ease-out">
                                          <div className="px-4 lg:px-5 pb-5 pt-3 border-t border-ink-900/5">
                                            <div className="pr-2">
                                              <p className="text-ink-800 leading-relaxed text-[12px] lg:text-[13px] whitespace-pre-wrap font-sans selection:bg-deep-yellow/30 text-justify">
                                                {renderContent(
                                                  art.content,
                                                  art.id,
                                                )}
                                              </p>
                                            </div>
                                            <div className="mt-6 pt-5 border-t border-ink-900/5 flex items-center justify-between">
                                              <div className="flex items-center gap-2 text-deep-yellow-dark/60 text-[9px] font-black uppercase tracking-[0.2em]">
                                                <Info size={14} />
                                                TRÍCH{" "}
                                                {docData.title.toUpperCase()}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-20">
                  <h3 className="text-lg font-bold text-slate-400">
                    Không có dữ liệu điều luật
                  </h3>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NoteModal({
  isOpen,
  onClose,
  initialData,
  onSave,
  onDelete,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialData: {
    articleId: string;
    text: string;
    noteId?: string;
    noteContent?: string;
    color?: string;
    isPinned?: boolean;
  } | null;
  onSave: (note: UserNote) => void;
  onDelete?: (noteId: string) => void;
}) {
  const [content, setContent] = useState("");
  const [color, setColor] = useState("yellow");
  const [isPinned, setIsPinned] = useState(true);

  useEffect(() => {
    if (isOpen && initialData) {
      setContent(initialData.noteContent || "");
      setColor(initialData.color || "yellow");
      setIsPinned(initialData.isPinned ?? true);
    }
  }, [isOpen, initialData]);

  if (!isOpen || !initialData) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden selection-menu-ignore"
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
            <MessageCircleHeart className="text-pink-500" size={20} />
            Ghi chú đoạn văn
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="pl-4 border-l-[3px] border-slate-900 bg-[#fef08a] py-3 pr-4 rounded-r-lg text-slate-800 text-sm italic">
            "
            {initialData.text.length > 100
              ? initialData.text.substring(0, 100) + "..."
              : initialData.text}
            "
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2">
              Nội dung ghi chú
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSave({
                    id: initialData.noteId || Date.now().toString(),
                    articleId: initialData.articleId,
                    text: initialData.text,
                    note: content,
                    color,
                    isPinned,
                  });
                  onClose();
                }
              }}
              placeholder="Bạn thắc mắc hay cần lưu ý gì ở đoạn này?"
              className="w-full border-2 border-yellow-400 outline-none rounded-xl p-3 text-sm min-h-[120px] resize-none focus:ring-4 focus:ring-yellow-400/20 transition-all font-medium text-slate-700 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide shrink-0">
                Màu sắc:
              </label>
              <div className="flex items-center gap-2.5">
                {[
                  { id: "yellow", hex: "#fef08a" },
                  { id: "green", hex: "#bbf7d0" },
                  { id: "blue", hex: "#bfdbfe" },
                  { id: "pink", hex: "#fbcfe8" },
                  { id: "purple", hex: "#e9d5ff" },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setColor(c.id)}
                    className={`w-7 h-7 rounded-full transition-all ${color === c.id ? "border-2 border-slate-900 scale-110" : "hover:scale-110 border border-slate-200 shadow-sm"}`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={() => setIsPinned(!isPinned)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${isPinned ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
              title={isPinned ? "Bỏ ghim khỏi Sidebar" : "Ghim lên Sidebar"}
            >
              {isPinned ? (
                <Pin size={16} className="fill-current" />
              ) : (
                <PinOff size={16} />
              )}
              {isPinned ? "Đã ghim" : "Ghim"}
            </button>
          </div>
        </div>

        <div className="p-5 pt-0 flex gap-3">
          {initialData.noteId && (
            <button
              onClick={() => {
                if (onDelete && initialData.noteId)
                  onDelete(initialData.noteId);
                onClose();
              }}
              className="px-6 py-3 text-red-600 bg-red-50 hover:bg-red-100 font-bold rounded-xl text-sm transition-colors whitespace-nowrap"
            >
              Xóa
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors flex justify-center items-center"
          >
            Đóng
          </button>
          <button
            onClick={() => {
              onSave({
                id: initialData.noteId || Date.now().toString(),
                articleId: initialData.articleId,
                text: initialData.text,
                note: content,
                color,
                isPinned,
              });
              onClose();
            }}
            className="flex-1 py-3 bg-[#0f172a] hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors flex justify-center items-center"
          >
            Lưu lại
          </button>
        </div>
      </motion.div>
    </div>
  );
}

const KEYWORD_SUGGESTIONS: string[] = [];

// Helper to extract relevant phrases dynamically
function extractPhrases(
  query: string,
  searchMode: "dtxd" | "sxkd" = "dtxd",
): string[] {
  const dynamicSet = new Set<string>();
  const lowerQ = query.trim().toLowerCase();

  if (lowerQ.length < 2) return [];

  // Split text by common clause-ending punctuation
  const splitTextToClauses = (text: string) => {
    return text.split(/[.,;:()!?\n\r"“”\[\]]/);
  };

  const processText = (text: string, isTitle: boolean = false) => {
    if (!text) return;

    if (isTitle && text.toLowerCase().includes(lowerQ)) {
      let cleanTitle = text.trim().replace(/\s+/g, " ");
      if (cleanTitle.length <= 150) {
        // It's a title, we can trust it makes grammatical sense
        dynamicSet.add(
          cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1),
        );
      }
    }

    const clauses = splitTextToClauses(text);
    for (let clause of clauses) {
      // Normalize whitespace
      clause = clause.trim().replace(/\s+/g, " ");

      // Remove common bullet points or numbering to make it a generic phrase
      clause = clause.replace(/^([a-zđ]\)|[-+*]|\d+\.)\s+/i, "");

      if (clause.length <= query.length) continue;

      if (clause.toLowerCase().includes(lowerQ)) {
        // Only extract whole clauses that are reasonably short to ensure they have perfect grammar
        // and don't overwhelm the UI. Punctuation boundaries naturally create meaningful phrases.
        if (clause.length <= 100) {
          clause = clause.charAt(0).toUpperCase() + clause.slice(1);
          dynamicSet.add(clause);
        }
      }
    }
  };

  try {
    const arraysToScan =
      searchMode === "dtxd"
        ? [allLawArticles, allNd214Articles, allTt79Articles]
        : [allDlArticles, allNd18Articles];

    for (const articles of arraysToScan) {
      for (const art of articles) {
        if (art.title) processText(art.title, true);
        if (art.content) processText(art.content, false);
        if (dynamicSet.size >= 15) return Array.from(dynamicSet).slice(0, 10);
      }
    }
  } catch (e) {
    console.error(e);
  }

  return Array.from(dynamicSet).slice(0, 10);
}

function AutocompleteInput({
  value,
  onChange,
  placeholder,
  className,
  containerClassName,
  iconSize = 14,
  dark = false,
  showClear = true,
  searchMode = "dtxd",
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  className?: string;
  containerClassName?: string;
  iconSize?: number;
  dark?: boolean;
  showClear?: boolean;
  searchMode?: "dtxd" | "sxkd";
}) {
  const [show, setShow] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setShow(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    if (!value.trim()) return [];

    const q = value.toLowerCase();
    const staticMatches = KEYWORD_SUGGESTIONS.filter((k) =>
      k.toLowerCase().includes(q),
    );
    const dynamicMatches = extractPhrases(value.trim(), searchMode);

    // Combine and remove duplicates (case-insensitive)
    const combined = [...staticMatches, ...dynamicMatches];
    const uniqueCombined: string[] = [];
    const seen = new Set<string>();

    for (const item of combined) {
      const lower = item.toLowerCase();
      if (!seen.has(lower)) {
        uniqueCombined.push(item);
        seen.add(lower);
      }
    }

    return uniqueCombined.slice(0, 8);
  }, [value]);

  return (
    <div className={`relative ${containerClassName}`} ref={wrapperRef}>
      <Search
        className={`absolute ${dark ? "left-3" : "left-5"} top-1/2 -translate-y-1/2 transition-colors z-10 ${dark ? "text-slate-400 group-focus-within:text-amber-400" : "text-slate-500 group-focus-within:text-deep-yellow"}`}
        size={iconSize}
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShow(true);
        }}
        onFocus={() => setShow(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setShow(false);
          }
        }}
        className={className}
      />
      {value && showClear && (
        <button
          onClick={() => {
            onChange("");
            setShow(false);
          }}
          className={`absolute right-3 top-1/2 -translate-y-1/2 ${dark ? "text-slate-400 hover:text-white" : "text-slate-400 hover:text-slate-600"} transition-colors z-10`}
        >
          <X size={iconSize} />
        </button>
      )}

      <AnimatePresence>
        {show && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className={`absolute top-full left-0 right-0 mt-1.5 rounded-xl border shadow-xl z-50 overflow-hidden ${dark ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-200 text-slate-700"}`}
          >
            {filtered.map((s) => (
              <div
                key={s}
                onClick={() => {
                  onChange(s);
                  setShow(false);
                }}
                className={`px-4 py-2 text-sm cursor-pointer transition-colors ${dark ? "hover:bg-amber-500/20 hover:text-white" : "hover:bg-slate-50 hover:text-deep-yellow-dark"}`}
              >
                <div className="flex items-center gap-2">
                  <Search
                    size={12}
                    className={dark ? "text-slate-500" : "text-slate-400"}
                  />
                  <span>{s}</span>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const scrollToElement = (
  elementId: string,
  block: ScrollLogicalPosition = "start",
  maxWaitMs = 1500,
  markTarget?:
    | { type: "note"; id?: string }
    | { type: "search"; text?: string },
  behavior: ScrollBehavior = "smooth",
) => {
  const startTime = Date.now();

  const tryScroll = () => {
    const el = document.getElementById(elementId);

    if (!el) {
      if (Date.now() - startTime < maxWaitMs) {
        requestAnimationFrame(tryScroll);
      }
      return;
    }

    const isArticle = elementId.includes("-art-");
    let isExpanded: Element | null = null;
    if (isArticle && markTarget) {
      isExpanded = el.querySelector(".overflow-hidden");
      if (!isExpanded) {
        if (Date.now() - startTime < maxWaitMs) {
          requestAnimationFrame(tryScroll);
          return;
        }
      }
    }

    if (markTarget && isExpanded) {
      let mark: Element | null = null;

      if (markTarget.type === "note") {
        mark = document.getElementById(`note-${markTarget.id}`);
      } else {
        mark = el.querySelector('p mark:not([id^="note-"])');
        if (!mark && markTarget.text) {
          const searchRegex = new RegExp(
            markTarget.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            "i",
          );
          const noteMarks = el.querySelectorAll('p mark[id^="note-"]');
          for (let i = 0; i < noteMarks.length; i++) {
            if (searchRegex.test(noteMarks[i].textContent || "")) {
              mark = noteMarks[i];
              break;
            }
          }
        }
      }

      if (!mark) {
        if (Date.now() - startTime < maxWaitMs) {
          requestAnimationFrame(tryScroll);
          return;
        } else {
          // Fallback: If mark is never found, just scroll to the article
          el.scrollIntoView({ behavior, block });
          return;
        }
      }

      if (mark) {
        setTimeout(() => {
          mark!.scrollIntoView({ behavior, block: "center" });
        }, 50);
        return;
      }
    }

    el.scrollIntoView({ behavior, block });
  };

  tryScroll();
};

function getChapterArticles(chapter: any) {
  const articles: any[] = [];
  if (chapter.articles)
    articles.push(
      ...chapter.articles.filter((a: any) => !a.id.includes("-empty")),
    );
  if (chapter.sections) {
    chapter.sections.forEach((s: any) => {
      if (s.articles)
        articles.push(
          ...s.articles.filter((a: any) => !a.id.includes("-empty")),
        );
    });
  }
  return articles;
}
export default function App() {
  const [selectedLuatIds, setSelectedLuatIds] = useState<string[]>([]);
  const [expandedLuatArticleId, setExpandedLuatArticleId] = useState<
    string | null
  >(null);

  const [selectedNdIds, setSelectedNdIds] = useState<string[]>([]);
  const [expandedNdArticleId, setExpandedNdArticleId] = useState<string | null>(
    null,
  );

  const [selectedTtIds, setSelectedTtIds] = useState<string[]>([]);
  const [expandedTtArticleId, setExpandedTtArticleId] = useState<string | null>(
    null,
  );

  const [selectedDlIds, setSelectedDlIds] = useState<string[]>([]);
  const [expandedDlArticleId, setExpandedDlArticleId] = useState<string | null>(
    null,
  );

  const [selectedNd18Ids, setSelectedNd18Ids] = useState<string[]>([]);
  const [expandedNd18ArticleId, setExpandedNd18ArticleId] = useState<
    string | null
  >(null);
  const [selectedTt42Ids, setSelectedTt42Ids] = useState<string[]>([]);
  const [expandedTt42ArticleId, setExpandedTt42ArticleId] = useState<
    string | null
  >(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchQueryLuat, setSearchQueryLuat] = useState("");
  const [searchQueryNd, setSearchQueryNd] = useState("");
  const [searchQueryTt, setSearchQueryTt] = useState("");
  const [searchQueryDl, setSearchQueryDl] = useState("");
  const [searchQueryNd18, setSearchQueryNd18] = useState("");
  const [searchQueryTt42, setSearchQueryTt42] = useState("");
  const [activePanes, setActivePanes] = useState<
    ("luat" | "nd214" | "tt79" | "luatDienLuc" | "nd18" | "tt42")[]
  >(["luat"]);
  const [searchMode, setSearchMode] = useState<"dtxd" | "sxkd">("dtxd");
  const [isDtxdExpanded, setIsDtxdExpanded] = useState(false);
  const [isSxkdExpanded, setIsSxkdExpanded] = useState(false);
  const isFirstRender = useRef(true);

  const togglePane = (
    paneId: "luat" | "nd214" | "tt79" | "luatDienLuc" | "nd18" | "tt42",
  ) => {
    if (paneId === "luatDienLuc" || paneId === "nd18" || paneId === "tt42") {
      setSearchMode("sxkd");
      setIsSxkdExpanded(true);
      setIsDtxdExpanded(false);
    } else {
      setSearchMode("dtxd");
      setIsDtxdExpanded(true);
      setIsSxkdExpanded(false);
    }
    setActivePanes((prev) => {
      if (paneId === "luatDienLuc" || paneId === "nd18" || paneId === "tt42") {
        let newPanes = prev.filter(
          (p) => p === "luatDienLuc" || p === "nd18" || p === "tt42",
        );
        if (newPanes.includes(paneId)) {
          newPanes = newPanes.filter((id) => id !== paneId);
        } else {
          newPanes = [...newPanes, paneId];
        }
        if (newPanes.length === 0) newPanes = [paneId]; // prevent empty
        const order = ["luatDienLuc", "nd18", "tt42"];
        return newPanes.sort(
          (a, b) => order.indexOf(a) - order.indexOf(b),
        ) as any;
      }

      let newPanes = prev.filter(
        (p) => p === "luat" || p === "nd214" || p === "tt79",
      );

      if (newPanes.includes(paneId as any)) {
        newPanes = newPanes.filter((id) => id !== paneId);
      } else {
        // Maintain a specific order when adding: luat, nd214, tt79
        newPanes = [...newPanes, paneId as any];
      }
      if (newPanes.length === 0) newPanes = [paneId as any];
      const order = ["luat", "nd214", "tt79"];
      return newPanes.sort(
        (a, b) => order.indexOf(a) - order.indexOf(b),
      ) as any;
    });
  };

  const deferredSearchQuery = useDeferredValue(searchQuery);
  const deferredSearchQueryLuat = useDeferredValue(searchQueryLuat);
  const deferredSearchQueryNd = useDeferredValue(searchQueryNd);
  const deferredSearchQueryTt = useDeferredValue(searchQueryTt);
  const deferredSearchQueryDl = useDeferredValue(searchQueryDl);
  const deferredSearchQueryNd18 = useDeferredValue(searchQueryNd18);
  const deferredSearchQueryTt42 = useDeferredValue(searchQueryTt42);

  const effectiveLuatSearch =
    searchMode === "dtxd"
      ? deferredSearchQueryLuat.trim() || deferredSearchQuery.trim()
      : deferredSearchQueryLuat.trim();
  const effectiveNdSearch =
    searchMode === "dtxd"
      ? deferredSearchQueryNd.trim() || deferredSearchQuery.trim()
      : deferredSearchQueryNd.trim();
  const effectiveTtSearch =
    searchMode === "dtxd"
      ? deferredSearchQueryTt.trim() || deferredSearchQuery.trim()
      : deferredSearchQueryTt.trim();
  const effectiveDlSearch =
    searchMode === "sxkd"
      ? deferredSearchQueryDl.trim() || deferredSearchQuery.trim()
      : deferredSearchQueryDl.trim();
  const effectiveNd18Search =
    searchMode === "sxkd"
      ? deferredSearchQueryNd18.trim() || deferredSearchQuery.trim()
      : deferredSearchQueryNd18.trim();
  const effectiveTt42Search =
    searchMode === "sxkd"
      ? deferredSearchQueryTt42.trim() || deferredSearchQuery.trim()
      : deferredSearchQueryTt42.trim();

  useEffect(() => {
    if (searchQuery.trim() !== deferredSearchQuery.trim()) return;
    const query = deferredSearchQuery.trim();
    if (query) {
      const q = query.toLowerCase();
      const hasMatch = (docData: any) =>
        docData.chapters.some(
          (ch: any) =>
            ch.title.toLowerCase().includes(q) ||
            ch.sections?.some(
              (s: any) =>
                s.title.toLowerCase().includes(q) ||
                s.articles.some(
                  (a: any) =>
                    a.title.toLowerCase().includes(q) ||
                    a.content.toLowerCase().includes(q),
                ),
            ) ||
            ch.articles?.some(
              (a: any) =>
                a.title.toLowerCase().includes(q) ||
                a.content.toLowerCase().includes(q),
            ),
        );

      const matchLuat = searchMode === "dtxd" && hasMatch(DOCUMENTS[0]);
      const matchNd = searchMode === "dtxd" && hasMatch(nghiDinh214Data);
      const matchTt = searchMode === "dtxd" && hasMatch(thongTu79Data);
      const matchDl = searchMode === "sxkd" && hasMatch(luatDienLucData);
      const matchNd18 = searchMode === "sxkd" && hasMatch(nghiDinh18Data);
      const matchTt42 = searchMode === "sxkd" && hasMatch(thongTu42Data);

      setActivePanes((prev) => {
        const newPanes = new Set(prev);
        let changed = false;

        if (searchMode === "dtxd") {
          newPanes.delete("luatDienLuc");
          newPanes.delete("nd18");
          newPanes.delete("tt42");
          if (matchLuat && !newPanes.has("luat")) {
            newPanes.add("luat");
            changed = true;
          }
          if (!matchLuat && newPanes.has("luat")) {
            newPanes.delete("luat");
            changed = true;
          }

          if (matchNd && !newPanes.has("nd214")) {
            newPanes.add("nd214");
            changed = true;
          }
          if (!matchNd && newPanes.has("nd214")) {
            newPanes.delete("nd214");
            changed = true;
          }

          if (matchTt && !newPanes.has("tt79")) {
            newPanes.add("tt79");
            changed = true;
          }
          if (!matchTt && newPanes.has("tt79")) {
            newPanes.delete("tt79");
            changed = true;
          }
        } else {
          newPanes.delete("luat");
          newPanes.delete("nd214");
          newPanes.delete("tt79");
          if (matchDl && !newPanes.has("luatDienLuc")) {
            newPanes.add("luatDienLuc");
            changed = true;
          }
          if (!matchDl && newPanes.has("luatDienLuc")) {
            newPanes.delete("luatDienLuc");
            changed = true;
          }
          if (matchNd18 && !newPanes.has("nd18")) {
            newPanes.add("nd18");
            changed = true;
          }
          if (!matchNd18 && newPanes.has("nd18")) {
            newPanes.delete("nd18");
            changed = true;
          }
          if (matchTt42 && !newPanes.has("tt42")) {
            newPanes.add("tt42");
            changed = true;
          }
          if (!matchTt42 && newPanes.has("tt42")) {
            newPanes.delete("tt42");
            changed = true;
          }
        }

        if (changed || newPanes.size !== prev.length) {
          const order = [
            "luat",
            "nd214",
            "tt79",
            "luatDienLuc",
            "nd18",
            "tt42",
          ];
          const sorted = Array.from(newPanes).sort(
            (a: any, b: any) => order.indexOf(a) - order.indexOf(b),
          ) as any[];
          if (sorted.length === 0) {
            return searchMode === "dtxd" ? ["luat"] : ["luatDienLuc"];
          }
          return sorted;
        }
        return prev;
      });
    }
  }, [deferredSearchQuery, searchMode, searchQuery]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showQAModal, setShowQAModal] = useState(false);
  const [showLegalBasis, setShowLegalBasis] = useState(false);
  const [showLegalBasisSXKD, setShowLegalBasisSXKD] = useState(false);

  interface BookmarkItem {
    articleId: string;
    docId: string;
    title: string;
  }

  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    try {
      const saved = localStorage.getItem("legal_bookmarks");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("legal_bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  const handleToggleBookmark = (
    articleId: string,
    docId: string,
    title: string,
  ) => {
    setBookmarks((prev) => {
      const exists = prev.find((b) => b.articleId === articleId);
      if (exists) {
        return prev.filter((b) => b.articleId !== articleId);
      }
      return [...prev, { articleId, docId, title }];
    });
  };

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  // Chapters with expanded sections in sidebar
  const [expandedSidebarChapters, setExpandedSidebarChapters] = useState<
    string[]
  >([]);

  // Document sections expansion in sidebar
  const [isLuatSidebarExpanded, setIsLuatSidebarExpanded] = useState(false);
  const [isNdSidebarExpanded, setIsNdSidebarExpanded] = useState(false);
  const [isTtSidebarExpanded, setIsTtSidebarExpanded] = useState(false);
  const [isDlSidebarExpanded, setIsDlSidebarExpanded] = useState(false);
  const [isNd18SidebarExpanded, setIsNd18SidebarExpanded] = useState(false);
  const [isTt42SidebarExpanded, setIsTt42SidebarExpanded] = useState(false);
  const [isBookmarksExpanded, setIsBookmarksExpanded] = useState(false);
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);

  // Notes state
  const [userNotes, setUserNotes] = useState<UserNote[]>(() => {
    try {
      const saved = localStorage.getItem("legal_notes");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("legal_notes", JSON.stringify(userNotes));
  }, [userNotes]);

  const [noteDraft, setNoteDraft] = useState<{
    articleId: string;
    text: string;
    noteId?: string;
    noteContent?: string;
    color?: string;
    isPinned?: boolean;
  } | null>(null);
  const [selectionMenu, setSelectionMenu] = useState<{
    top: number;
    left: number;
    text: string;
    articleId: string;
  } | null>(null);

  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest(".selection-menu-ignore")) return;

      setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) {
          setSelectionMenu(null);
          return;
        }

        const text = selection.toString().trim();
        if (!text) {
          setSelectionMenu(null);
          return;
        }

        let node = selection.anchorNode;
        let articleId = "";
        while (node && node !== document.body) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            const id = el.getAttribute("data-article-id");
            if (id) {
              articleId = id;
              break;
            }
          }
          if (node.parentNode) node = node.parentNode;
          else break;
        }

        if (articleId) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          setSelectionMenu({
            top: rect.top - 50,
            left: rect.left + rect.width / 2,
            text,
            articleId,
          });
        } else {
          setSelectionMenu(null);
        }
      }, 10);
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, []);

  const [globalTooltip, setGlobalTooltip] = useState<{
    content: string;
    top: number;
    left: number;
    arrowOffset: number;
  } | null>(null);

  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("[data-note-tooltip]");
      if (!target) {
        setGlobalTooltip(null);
        return;
      }

      const content = target.getAttribute("data-note-tooltip");
      if (!content) {
        setGlobalTooltip(null);
        return;
      }

      const rect = target.getBoundingClientRect();
      const markCenter = rect.left + rect.width / 2;
      let top = rect.top - 8;

      const approxTooltipWidth = 320;
      const padding = 16;
      let left = markCenter;
      left = Math.max(left, padding + approxTooltipWidth / 2);
      left = Math.min(
        left,
        window.innerWidth - padding - approxTooltipWidth / 2,
      );

      const arrowOffset = markCenter - left;

      setGlobalTooltip({ content, top, left, arrowOffset });
    };

    // We also want to clear tooltip on mouse out, wait actually `mouseover` on document handles clearing if target is not a tooltip.
    // But occasionally you move out of window.

    const handleMouseOut = (e: MouseEvent) => {
      // If moving to an element that doesn't have the tooltip or isn't inside one
      if (
        e.relatedTarget &&
        !(e.relatedTarget as HTMLElement).closest("[data-note-tooltip]")
      ) {
        setGlobalTooltip(null);
      }
    };

    const handleScroll = () => {
      setGlobalTooltip(null);
    };

    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
    document.addEventListener("wheel", handleScroll, {
      capture: true,
      passive: true,
    });
    document.addEventListener("touchmove", handleScroll, {
      capture: true,
      passive: true,
    });
    document.addEventListener("scroll", handleScroll, {
      capture: true,
      passive: true,
    });

    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      document.removeEventListener("wheel", handleScroll, {
        capture: true,
      } as any);
      document.removeEventListener("touchmove", handleScroll, {
        capture: true,
      } as any);
      document.removeEventListener("scroll", handleScroll, {
        capture: true,
      } as any);
    };
  }, []);

  const handleSaveNote = (note: UserNote) => {
    setUserNotes((prev) => {
      const idx = prev.findIndex((n) => n.id === note.id);
      if (idx >= 0) {
        const newNotes = [...prev];
        newNotes[idx] = note;
        return newNotes;
      }
      return [...prev, note];
    });
  };

  const handleDeleteNote = (noteId: string) => {
    setUserNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  // Sidebar Resizing
  const [sidebarWidth, setSidebarWidth] = useState(230);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing) {
        const newWidth = mouseMoveEvent.clientX;
        if (newWidth >= 220 && newWidth <= 500) {
          setSidebarWidth(newWidth);
        }
      }
    },
    [isResizing],
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize as any);
      window.addEventListener("mouseup", stopResizing);
    } else {
      window.removeEventListener("mousemove", resize as any);
      window.removeEventListener("mouseup", stopResizing);
    }
    return () => {
      window.removeEventListener("mousemove", resize as any);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  const toggleSidebarChapter = (e: any, chapterId: string) => {
    e.stopPropagation();
    setExpandedSidebarChapters((prev) =>
      prev.includes(chapterId)
        ? prev.filter((id) => id !== chapterId)
        : [...prev, chapterId],
    );
  };

  const handleScrollTo = (
    e: any,
    docId: string,
    type: "chapter" | "section",
    id: string,
  ) => {
    e.stopPropagation();

    // Select the chapter/section if it is not already selected so it renders
    if (docId === "luat") {
      if (!selectedLuatIds.includes(id)) handleSelectLuat(id);
    } else if (docId === "nd214") {
      if (!selectedNdIds.includes(id)) handleSelectNd(id);
    } else if (docId === "tt79") {
      if (!selectedTtIds.includes(id)) handleSelectTt(id);
    } else if (docId === "luatDienLuc") {
      if (!selectedDlIds.includes(id)) handleSelectDl(id);
    } else if (docId === "nd18") {
      if (!selectedNd18Ids.includes(id)) handleSelectNd18(id);
    } else if (docId === "tt42") {
      if (!selectedTt42Ids.includes(id)) handleSelectTt42(id);
    }

    // Rely on handleSelect* to manage activePanes correctly, so we don't duplicate logic.
    // Ensure we switch view modes properly if navigating from a different mode
    const newSearchMode =
      docId === "luatDienLuc" || docId === "nd18" || docId === "tt42"
        ? "sxkd"
        : "dtxd";
    setSearchMode(newSearchMode);
    if (newSearchMode === "sxkd") {
      setIsSxkdExpanded(true);
      setIsDtxdExpanded(false);
    } else {
      setIsDtxdExpanded(true);
      setIsSxkdExpanded(false);
    }

    let targetType = type;
    let targetId = id;
    
    if (type === "chapter") {
      let docData: any = null;
      if (docId === "luat") docData = DOCUMENTS[0];
      else if (docId === "nd214") docData = nghiDinh214Data;
      else if (docId === "tt79") docData = thongTu79Data;
      else if (docId === "luatDienLuc") docData = luatDienLucData;
      else if (docId === "nd18") docData = nghiDinh18Data;
      else if (docId === "tt42") docData = thongTu42Data;
      
      if (docData) {
        const chapter = docData.chapters.find((c: any) => c.id === id);
        if (chapter) {
          if (chapter.articles && chapter.articles.length > 0) {
            targetType = "art" as any;
            targetId = chapter.articles[0].id;
          } else if (chapter.sections && chapter.sections.length > 0) {
            const section = chapter.sections[0];
            if (section.articles && section.articles.length > 0) {
              targetType = "art" as any;
              targetId = section.articles[0].id;
            } else {
              targetType = "section";
              targetId = section.id;
            }
          }
        }
      }
    }

    // Scroll to the element
    scrollToElement(`${docId}-${targetType}-${targetId}`, "start", 1500, undefined, "auto");
  };

  const executeScroll = (
    articleId?: string,
    noteId?: string,
    docId?: string,
  ) => {
    if (articleId && docId) {
      if (noteId) {
        scrollToElement(
          `${docId}-art-${articleId}`,
          "start",
          1500,
          { type: "note", id: noteId },
          "smooth",
        );
      } else {
        const text =
          docId === "luat"
            ? effectiveLuatSearch
            : docId === "nd214"
              ? effectiveNdSearch
              : docId === "tt79"
                ? effectiveTtSearch
                : docId === "nd18"
                  ? effectiveNd18Search
                  : docId === "tt42"
                    ? effectiveTt42Search
                    : effectiveDlSearch;
        scrollToElement(
          `${docId}-art-${articleId}`,
          "start",
          1500,
          text ? { type: "search", text } : undefined,
          "smooth",
        );
      }
    }
  };

  const handleSelectLuat = (
    id: string | string[],
    articleId?: string,
    noteId?: string,
  ) => {
    setActivePanes((prev) => {
      const p = prev.filter(
        (x) => x !== "luatDienLuc" && x !== "nd18" && x !== "tt42",
      );
      return p.includes("luat") ? p : ([...p, "luat"] as any);
    });
    if (Array.isArray(id)) {
      setSelectedLuatIds(id);
    } else {
      setSelectedLuatIds((prev) => {
        if (prev.includes(id)) {
          return prev.filter((i) => i !== id);
        }

        let newIds = [...prev];
        if (id.includes("-S")) {
          const parentChapterId = id.split("-S")[0];
          newIds = newIds.filter((i) => i !== parentChapterId);
        } else {
          newIds = newIds.filter((i) => !i.startsWith(`${id}-S`));
        }
        return [...newIds, id];
      });
    }

    if (!effectiveLuatSearch) {
      setExpandedLuatArticleId(null);
    }
    if (articleId) {
      setExpandedLuatArticleId(articleId);
      executeScroll(articleId, noteId, "luat");
    }
    if (window.innerWidth < 1024 && (articleId || !Array.isArray(id)))
      setIsSidebarOpen(false);
  };

  const handleSelectNd = (
    id: string | string[],
    articleId?: string,
    noteId?: string,
  ) => {
    setActivePanes((prev) => {
      const p = prev.filter(
        (x) => x !== "luatDienLuc" && x !== "nd18" && x !== "tt42",
      );
      return p.includes("nd214") ? p : ([...p, "nd214"] as any);
    });
    if (Array.isArray(id)) {
      setSelectedNdIds(id);
    } else {
      setSelectedNdIds((prev) => {
        if (prev.includes(id)) {
          return prev.filter((i) => i !== id);
        }

        let newIds = [...prev];
        if (id.includes("-S")) {
          const parentChapterId = id.split("-S")[0];
          newIds = newIds.filter((i) => i !== parentChapterId);
        } else {
          newIds = newIds.filter((i) => !i.startsWith(`${id}-S`));
        }
        return [...newIds, id];
      });
    }

    if (!effectiveNdSearch) {
      setExpandedNdArticleId(null);
    }
    if (articleId) {
      setExpandedNdArticleId(articleId);
      executeScroll(articleId, noteId, "nd214");
    }
    if (window.innerWidth < 1024 && (articleId || !Array.isArray(id)))
      setIsSidebarOpen(false);
  };

  const handleSelectTt = (
    id: string | string[],
    articleId?: string,
    noteId?: string,
  ) => {
    setActivePanes((prev) => {
      const p = prev.filter(
        (x) => x !== "luatDienLuc" && x !== "nd18" && x !== "tt42",
      );
      return p.includes("tt79") ? p : ([...p, "tt79"] as any);
    });
    if (Array.isArray(id)) {
      setSelectedTtIds(id);
    } else {
      setSelectedTtIds((prev) => {
        if (prev.includes(id)) {
          return prev.filter((i) => i !== id);
        }

        let newIds = [...prev];
        if (id.includes("-S")) {
          const parentChapterId = id.split("-S")[0];
          newIds = newIds.filter((i) => i !== parentChapterId);
        } else {
          newIds = newIds.filter((i) => !i.startsWith(`${id}-S`));
        }
        return [...newIds, id];
      });
    }

    if (!effectiveTtSearch) {
      setExpandedTtArticleId(null);
    }
    if (articleId) {
      setExpandedTtArticleId(articleId);
      executeScroll(articleId, noteId, "tt79");
    }
    if (window.innerWidth < 1024 && (articleId || !Array.isArray(id)))
      setIsSidebarOpen(false);
  };

  const handleSelectDl = (
    id: string | string[],
    articleId?: string,
    noteId?: string,
  ) => {
    setActivePanes((prev) => {
      const p = prev.filter(
        (x) => x === "luatDienLuc" || x === "nd18" || x === "tt42",
      );
      return p.includes("luatDienLuc") ? p : ([...p, "luatDienLuc"] as any);
    });
    if (Array.isArray(id)) {
      setSelectedDlIds(id);
    } else {
      setSelectedDlIds((prev) => {
        if (prev.includes(id)) {
          return prev.filter((i) => i !== id);
        }

        let newIds = [...prev];
        if (id.includes("-S")) {
          const parentChapterId = id.split("-S")[0];
          newIds = newIds.filter((i) => i !== parentChapterId);
        } else {
          newIds = newIds.filter((i) => !i.startsWith(`${id}-S`));
        }
        return [...newIds, id];
      });
    }

    if (!effectiveDlSearch) {
      setExpandedDlArticleId(null);
    }
    if (articleId) {
      setExpandedDlArticleId(articleId);
      executeScroll(articleId, noteId, "luatDienLuc");
    }
    if (window.innerWidth < 1024 && (articleId || !Array.isArray(id)))
      setIsSidebarOpen(false);
  };

  const handleSelectNd18 = (
    id: string | string[],
    articleId?: string,
    noteId?: string,
  ) => {
    setActivePanes((prev) => {
      const p = prev.filter(
        (x) => x === "luatDienLuc" || x === "nd18" || x === "tt42",
      );
      return p.includes("nd18") ? p : ([...p, "nd18"] as any);
    });
    if (Array.isArray(id)) {
      setSelectedNd18Ids(id);
    } else {
      setSelectedNd18Ids((prev) => {
        if (prev.includes(id)) {
          return prev.filter((i) => i !== id);
        }

        let newIds = [...prev];
        if (id.includes("-S")) {
          const parentChapterId = id.split("-S")[0];
          newIds = newIds.filter((i) => i !== parentChapterId);
        } else {
          newIds = newIds.filter((i) => !i.startsWith(`${id}-S`));
        }
        return [...newIds, id];
      });
    }

    if (!effectiveNd18Search) {
      setExpandedNd18ArticleId(null);
    }
    if (articleId) {
      setExpandedNd18ArticleId(articleId);
      executeScroll(articleId, noteId, "nd18");
    }
    if (window.innerWidth < 1024 && (articleId || !Array.isArray(id)))
      setIsSidebarOpen(false);
  };

  const handleSelectTt42 = (
    id: string | string[],
    articleId?: string,
    noteId?: string,
  ) => {
    setActivePanes((prev) => {
      const p = prev.filter(
        (x) => x === "luatDienLuc" || x === "nd18" || x === "tt42",
      );
      return p.includes("tt42") ? p : ([...p, "tt42"] as any);
    });
    if (Array.isArray(id)) {
      setSelectedTt42Ids(id);
    } else {
      setSelectedTt42Ids((prev) => {
        if (prev.includes(id)) {
          return prev.filter((i) => i !== id);
        }

        let newIds = [...prev];
        if (id.includes("-S")) {
          const parentChapterId = id.split("-S")[0];
          newIds = newIds.filter((i) => i !== parentChapterId);
        } else {
          newIds = newIds.filter((i) => !i.startsWith(`${id}-S`));
        }
        return [...newIds, id];
      });
    }

    if (!effectiveTt42Search) {
      setExpandedTt42ArticleId(null);
    }
    if (articleId) {
      setExpandedTt42ArticleId(articleId);
      executeScroll(articleId, noteId, "tt42");
    }
    if (window.innerWidth < 1024 && (articleId || !Array.isArray(id)))
      setIsSidebarOpen(false);
  };

  return (
    <div
      className={`flex h-screen bg-white font-sans text-ink-900 overflow-hidden ${isResizing ? "select-none cursor-col-resize" : ""}`}
      id="app-container"
    >
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ marginLeft: isSidebarOpen ? 0 : -sidebarWidth }}
        transition={{ duration: isResizing ? 0 : 0.3, ease: "easeInOut" }}
        style={{ width: sidebarWidth }}
        className={`fixed lg:relative z-50 h-full bg-cream-100 border-r border-ink-900/5 flex flex-col shadow-2xl lg:shadow-none shrink-0 overflow-visible`}
        id="sidebar"
      >
        {/* Resize Handle */}
        <div
          onMouseDown={startResizing}
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-deep-yellow/30 active:bg-deep-yellow/50 transition-colors z-50 hidden lg:block ${isResizing ? "bg-deep-yellow/50" : ""}`}
        />

        <div className="p-4 border-b border-ink-900/5 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0 group">
              <div className="absolute inset-0 rounded-full border-2 border-red-900/20 scale-[1.10] pointer-events-none" />
              <div className="absolute inset-0 rounded-full border border-amber-500/30 scale-105 pointer-events-none" />

              <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden relative shadow-md">
                <img
                  src={logoBase64}
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <h1 className="font-bold text-[15px] leading-snug text-ink-900 tracking-tight flex-1 whitespace-nowrap">
              iLaw ĐTXD-SXKD
            </h1>

            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-ink-900/5 rounded-full shrink-0"
            >
              <X size={18} />
            </button>
          </div>

          <p className="text-[10px] text-ink-800/50 font-medium italic tracking-wide pl-1">
            Hệ thống hỗ trợ tra cứu nhanh
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0 scrollbar-thin">
          <div className="mb-2">
            <div
              className={`flex items-center justify-between mb-3 px-2 py-1.5 cursor-pointer select-none rounded-[10px] transition-colors ${searchMode === "dtxd" ? "bg-amber-100 text-amber-900 border border-amber-200" : "hover:bg-slate-100 text-slate-500"}`}
              onClick={() => {
                if (searchMode === "dtxd") {
                  setIsDtxdExpanded(!isDtxdExpanded);
                } else {
                  setSearchMode("dtxd");
                  setIsDtxdExpanded(true);
                  setIsSxkdExpanded(false);
                  setActivePanes((prev) => {
                    if (
                      prev.includes("luatDienLuc") ||
                      prev.includes("nd18") ||
                      prev.includes("tt42") ||
                      prev.length === 0
                    )
                      return ["luat"];
                    return prev;
                  });
                }
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${searchMode === "dtxd" ? "bg-amber-500" : "bg-slate-300"}`}
                />
                <h2 className="text-xs font-bold uppercase tracking-wider">
                  Công tác ĐTXD
                </h2>
              </div>
              {searchMode === "dtxd" && (
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ${isDtxdExpanded ? "rotate-180" : ""}`}
                />
              )}
            </div>

            <div
              className={`space-y-4 transition-all duration-300 ${searchMode === "dtxd" && isDtxdExpanded ? "opacity-100 h-auto" : "opacity-0 h-0 overflow-hidden pointer-events-none"}`}
            >
              <div className="space-y-1">
                <button
                  onClick={() => setShowLegalBasis(!showLegalBasis)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-all group ${
                    showLegalBasis
                      ? "bg-white text-ink-900 shadow-xl shadow-ink-900/5 ring-1 ring-ink-900/5"
                      : "bg-white/50 border border-ink-900/5 hover:bg-white hover:shadow-md text-ink-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2 rounded-lg transition-colors bg-cream-100 text-ink-900`}
                    >
                      <Scale size={20} strokeWidth={1.5} />
                    </div>
                    <span
                      className={`font-bold transition-all ${showLegalBasis ? "text-sm" : "text-xs"}`}
                    >
                      Pháp lý
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ${showLegalBasis ? "rotate-180 text-slate-400" : "text-slate-300"}`}
                  />
                </button>
                <AnimatePresence>
                  {showLegalBasis && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 space-y-4 bg-white rounded-2xl mt-1 border border-ink-900/5 shadow-sm">
                        <p className="text-[10px] text-ink-800/60 font-medium leading-relaxed italic">
                          VBHN số 74/VBHN-VPQH hợp nhất các Luật:
                        </p>
                        <ul className="space-y-4">
                          {[
                            "Luật Đấu thầu số 22/2023/QH15",
                            "Luật số 57/2024/QH15",
                            "Luật số 90/2025/QH15",
                            "Luật An ninh mạng số 116/2025/QH15",
                            "Luật Công nghệ cao số 133/2025/QH15",
                            "Luật Phục hồi, phá sản số 142/2025/QH15",
                          ].map((law, idx) => (
                            <li key={idx} className="flex gap-3 items-start">
                              <div className="mt-2 w-1.5 h-1.5 rounded-full bg-deep-yellow shrink-0" />
                              <span className="text-xs text-ink-900 font-medium leading-snug italic">
                                {law}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="h-px bg-ink-900/5 mx-2 my-2" />

              {/* Luật Đấu Thầu Section */}
              <div className="space-y-1">
                <button
                  onClick={() =>
                    setIsLuatSidebarExpanded(!isLuatSidebarExpanded)
                  }
                  className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-all group ${
                    isLuatSidebarExpanded
                      ? "bg-white text-ink-900 shadow-xl shadow-ink-900/5 ring-1 ring-ink-900/5"
                      : "bg-white/50 border border-ink-900/5 hover:bg-white hover:shadow-md text-ink-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2 rounded-lg transition-colors bg-cream-100 text-ink-900`}
                    >
                      <Gavel size={20} strokeWidth={1.5} />
                    </div>
                    <span
                      className={`font-bold transition-all ${isLuatSidebarExpanded ? "text-sm" : "text-xs"}`}
                    >
                      Luật Đấu Thầu
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ${isLuatSidebarExpanded ? "rotate-180 text-slate-400" : "text-slate-300"}`}
                  />
                </button>

                <AnimatePresence>
                  {isLuatSidebarExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-2 pr-0 pt-2 pb-1">
                        {DOCUMENTS.filter((d) => d.id === "luat").map((doc) => {
                          const filteredChapters = effectiveLuatSearch
                            ? doc.chapters.filter(
                                (ch) =>
                                  ch.title
                                    .toLowerCase()
                                    .includes(
                                      effectiveLuatSearch.toLowerCase(),
                                    ) ||
                                  ch.sections?.some((s) =>
                                    s.title
                                      .toLowerCase()
                                      .includes(
                                        effectiveLuatSearch.toLowerCase(),
                                      ),
                                  ) ||
                                  ch.articles?.some(
                                    (a) =>
                                      a.title
                                        .toLowerCase()
                                        .includes(
                                          effectiveLuatSearch.toLowerCase(),
                                        ) ||
                                      a.content
                                        .toLowerCase()
                                        .includes(
                                          effectiveLuatSearch.toLowerCase(),
                                        ),
                                  ) ||
                                  ch.sections?.some((s) =>
                                    s.articles.some(
                                      (a) =>
                                        a.title
                                          .toLowerCase()
                                          .includes(
                                            effectiveLuatSearch.toLowerCase(),
                                          ) ||
                                        a.content
                                          .toLowerCase()
                                          .includes(
                                            effectiveLuatSearch.toLowerCase(),
                                          ),
                                    ),
                                  ),
                              )
                            : doc.chapters;

                          return (
                            <div key={doc.id} className="space-y-1">
                              <button
                                onClick={() => {
                                  const allIds = doc.chapters.map(
                                    (ch) => ch.id,
                                  );
                                  const isAll = allIds.every((id) =>
                                    selectedLuatIds.includes(id),
                                  );
                                  handleSelectLuat(isAll ? [] : allIds);
                                }}
                                className="w-full text-left px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest text-deep-yellow-dark hover:bg-deep-yellow/5 mb-1 flex items-center gap-2"
                              >
                                <Filter size={10} />
                                {doc.chapters.every((ch) =>
                                  selectedLuatIds.includes(ch.id),
                                )
                                  ? "Bỏ chọn tất cả"
                                  : "Chọn tất cả chương"}
                              </button>

                              {filteredChapters.map((chapter) => {
                                const isSelected = selectedLuatIds.includes(
                                  chapter.id,
                                );
                                const isExpanded =
                                  expandedSidebarChapters.includes(chapter.id);
                                const hasSections =
                                  chapter.sections &&
                                  chapter.sections.length > 0;

                                return (
                                  <div key={chapter.id} className="mb-1.5">
                                    <button
                                      onClick={() =>
                                        handleSelectLuat(chapter.id)
                                      }
                                      className={`w-full text-left pr-8 pl-2 py-2 rounded-xl text-[11px] transition-all duration-300 flex items-center gap-2 group relative ${
                                        isSelected && !effectiveLuatSearch
                                          ? "bg-yellow-400 text-slate-900 font-bold shadow-md shadow-yellow-400/40"
                                          : "text-ink-800 hover:bg-ink-900/5 font-semibold"
                                      }`}
                                    >
                                      <div
                                        className="p-1 rounded-md shrink-0 transition-colors"
                                        onClick={
                                          hasSections
                                            ? (e) =>
                                                toggleSidebarChapter(
                                                  e,
                                                  chapter.id,
                                                )
                                            : undefined
                                        }
                                      >
                                        <ChevronRight
                                          size={12}
                                          className={`transition-transform duration-300 ${isSelected ? "text-slate-900" : "text-slate-400"} ${isExpanded ? "rotate-90" : ""} ${!hasSections ? "opacity-0" : ""}`}
                                        />
                                      </div>
                                      <span className="text-[11px] tracking-tight leading-snug whitespace-normal break-words py-0.5">
                                        {chapter.title.split(":")[0] ||
                                          chapter.title}
                                      </span>
                                      <div
                                        className="absolute right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-black/10 rounded-md text-slate-500 hover:text-blue-700"
                                        onClick={(e) =>
                                          handleScrollTo(
                                            e,
                                            "luat",
                                            "chapter",
                                            chapter.id,
                                          )
                                        }
                                        title="Chuyển đến"
                                      >
                                        <Target size={14} />
                                      </div>
                                    </button>

                                    <AnimatePresence>
                                      {hasSections && isExpanded && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{
                                            height: "auto",
                                            opacity: 1,
                                          }}
                                          exit={{ height: 0, opacity: 0 }}
                                          className="bg-ink-900/5 mx-2 rounded-xl overflow-hidden mt-1"
                                        >
                                          <div className="px-2 py-1.5 space-y-0.5">
                                            {chapter.sections!.map(
                                              (section) => {
                                                const isSectionSelected =
                                                  selectedLuatIds.includes(
                                                    section.id,
                                                  );
                                                return (
                                                  <div
                                                    key={section.id}
                                                    className="relative group/sec"
                                                  >
                                                    <button
                                                      onClick={() =>
                                                        handleSelectLuat(
                                                          section.id,
                                                        )
                                                      }
                                                      className={`w-full text-left pr-6 pl-3 py-1.5 rounded-lg text-[9px] transition-all duration-200 block font-medium whitespace-normal break-words ${
                                                        isSectionSelected &&
                                                        !effectiveLuatSearch
                                                          ? "text-deep-yellow-dark font-black bg-white shadow-sm"
                                                          : "text-ink-800/60 hover:text-ink-900 hover:bg-white/50"
                                                      }`}
                                                    >
                                                      {section.title}
                                                    </button>
                                                    <div
                                                      className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/sec:opacity-100 transition-opacity p-1 hover:bg-black/10 rounded-md text-slate-400 hover:text-blue-700 cursor-pointer"
                                                      onClick={(e) =>
                                                        handleScrollTo(
                                                          e,
                                                          "luat",
                                                          "section",
                                                          section.id,
                                                        )
                                                      }
                                                      title="Chuyển đến"
                                                    >
                                                      <Target size={12} />
                                                    </div>
                                                  </div>
                                                );
                                              },
                                            )}
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Nghị định 214 Section */}
              <div className="space-y-1">
                <button
                  onClick={() => setIsNdSidebarExpanded(!isNdSidebarExpanded)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-all group ${
                    isNdSidebarExpanded
                      ? "bg-white text-ink-900 shadow-xl shadow-ink-900/5 ring-1 ring-ink-900/5"
                      : "bg-white/50 border border-ink-900/5 hover:bg-white hover:shadow-md text-ink-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2 rounded-lg transition-colors bg-cream-100 text-ink-900`}
                    >
                      <ClipboardCheck size={20} strokeWidth={1.5} />
                    </div>
                    <span
                      className={`font-bold transition-all ${isNdSidebarExpanded ? "text-sm" : "text-xs"}`}
                    >
                      Nghị định 214
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ${isNdSidebarExpanded ? "rotate-180 text-slate-400" : "text-slate-300"}`}
                  />
                </button>

                <AnimatePresence>
                  {isNdSidebarExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-2 pr-0 pt-2 pb-10">
                        {(() => {
                          const allNdChapters = nghiDinh214Data.chapters.map(
                            (ch) => ch.id,
                          );
                          const isAllNdSelected =
                            allNdChapters.length > 0 &&
                            allNdChapters.every((id) =>
                              selectedNdIds.includes(id),
                            );

                          const filteredNdChapters = effectiveNdSearch
                            ? nghiDinh214Data.chapters.filter(
                                (ch) =>
                                  ch.title
                                    .toLowerCase()
                                    .includes(
                                      effectiveNdSearch.toLowerCase(),
                                    ) ||
                                  ch.articles?.some(
                                    (a) =>
                                      a.title
                                        .toLowerCase()
                                        .includes(
                                          effectiveNdSearch.toLowerCase(),
                                        ) ||
                                      a.content
                                        .toLowerCase()
                                        .includes(
                                          effectiveNdSearch.toLowerCase(),
                                        ),
                                  ),
                              )
                            : nghiDinh214Data.chapters;

                          return (
                            <div className="space-y-1">
                              <button
                                onClick={() =>
                                  handleSelectNd(
                                    isAllNdSelected ? [] : allNdChapters,
                                  )
                                }
                                className="w-full text-left px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest text-deep-yellow-dark hover:bg-deep-yellow/5 mb-1 flex items-center gap-2"
                              >
                                <Filter size={10} />
                                {isAllNdSelected
                                  ? "Bỏ chọn tất cả"
                                  : "Chọn tất cả chương"}
                              </button>

                              {filteredNdChapters.map((chapter) => {
                                const isSelected = selectedNdIds.includes(
                                  chapter.id,
                                );

                                return (
                                  <div key={chapter.id} className="mb-1.5">
                                    <button
                                      onClick={() => handleSelectNd(chapter.id)}
                                      className={`w-full text-left pr-8 pl-2 py-2 rounded-xl text-[11px] transition-all duration-300 flex items-center gap-2 group relative ${
                                        isSelected && !effectiveNdSearch
                                          ? "bg-yellow-400 text-slate-900 font-bold shadow-md shadow-yellow-400/40"
                                          : "text-ink-800 hover:bg-ink-900/5 font-semibold"
                                      }`}
                                    >
                                      <div className="p-1 rounded-md shrink-0">
                                        <ChevronRight
                                          size={12}
                                          className={`transition-transform opacity-0`}
                                        />
                                      </div>
                                      <span className="text-[11px] tracking-tight leading-snug whitespace-normal break-words py-0.5">
                                        {chapter.title}
                                      </span>
                                      <div
                                        className="absolute right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-black/10 rounded-md text-slate-500 hover:text-blue-700"
                                        onClick={(e) =>
                                          handleScrollTo(
                                            e,
                                            "nd214",
                                            "chapter",
                                            chapter.id,
                                          )
                                        }
                                        title="Chuyển đến"
                                      >
                                        <Target size={14} />
                                      </div>
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Thông tư 79 Section */}
              <div className="space-y-1">
                <button
                  onClick={() => setIsTtSidebarExpanded(!isTtSidebarExpanded)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-all group ${
                    isTtSidebarExpanded
                      ? "bg-white text-ink-900 shadow-xl shadow-ink-900/5 ring-1 ring-ink-900/5"
                      : "bg-white/50 border border-ink-900/5 hover:bg-white hover:shadow-md text-ink-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2 rounded-lg transition-colors bg-cream-100 text-ink-900`}
                    >
                      <BookOpen size={20} strokeWidth={1.5} />
                    </div>
                    <span
                      className={`font-bold transition-all ${isTtSidebarExpanded ? "text-sm" : "text-xs"}`}
                    >
                      Thông tư 79
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ${isTtSidebarExpanded ? "rotate-180 text-slate-400" : "text-slate-300"}`}
                  />
                </button>

                <AnimatePresence>
                  {isTtSidebarExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-2 pr-0 pt-2 pb-10">
                        {(() => {
                          const allTtChapters = thongTu79Data.chapters.map(
                            (ch) => ch.id,
                          );
                          const isAllTtSelected =
                            allTtChapters.length > 0 &&
                            allTtChapters.every((id) =>
                              selectedTtIds.includes(id),
                            );

                          const filteredTtChapters = effectiveTtSearch
                            ? thongTu79Data.chapters.filter(
                                (ch) =>
                                  ch.title
                                    .toLowerCase()
                                    .includes(
                                      effectiveTtSearch.toLowerCase(),
                                    ) ||
                                  ch.articles?.some(
                                    (a) =>
                                      a.title
                                        .toLowerCase()
                                        .includes(
                                          effectiveTtSearch.toLowerCase(),
                                        ) ||
                                      a.content
                                        .toLowerCase()
                                        .includes(
                                          effectiveTtSearch.toLowerCase(),
                                        ),
                                  ),
                              )
                            : thongTu79Data.chapters;

                          return (
                            <div className="space-y-1">
                              <button
                                onClick={() =>
                                  handleSelectTt(
                                    isAllTtSelected ? [] : allTtChapters,
                                  )
                                }
                                className="w-full text-left px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest text-deep-yellow-dark hover:bg-deep-yellow/5 mb-1 flex items-center gap-2"
                              >
                                <Filter size={10} />
                                {isAllTtSelected
                                  ? "Bỏ chọn tất cả"
                                  : "Chọn tất cả chương"}
                              </button>

                              {filteredTtChapters.map((chapter) => {
                                const isSelected = selectedTtIds.includes(
                                  chapter.id,
                                );

                                return (
                                  <div key={chapter.id} className="mb-1.5">
                                    <button
                                      onClick={() => handleSelectTt(chapter.id)}
                                      className={`w-full text-left pr-8 pl-2 py-2 rounded-xl text-[11px] transition-all duration-300 flex items-center gap-2 group relative ${
                                        isSelected && !effectiveTtSearch
                                          ? "bg-yellow-400 text-slate-900 font-bold shadow-md shadow-yellow-400/40"
                                          : "text-ink-800 hover:bg-ink-900/5 font-semibold"
                                      }`}
                                    >
                                      <div className="p-1 rounded-md shrink-0">
                                        <ChevronRight
                                          size={12}
                                          className={`transition-transform opacity-0`}
                                        />
                                      </div>
                                      <span className="text-[11px] tracking-tight leading-snug whitespace-normal break-words py-0.5">
                                        {chapter.title}
                                      </span>
                                      <div
                                        className="absolute right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-black/10 rounded-md text-slate-500 hover:text-blue-700"
                                        onClick={(e) =>
                                          handleScrollTo(
                                            e,
                                            "tt79",
                                            "chapter",
                                            chapter.id,
                                          )
                                        }
                                        title="Chuyển đến"
                                      >
                                        <Target size={14} />
                                      </div>
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="h-px bg-ink-900/5 mx-2 my-4" />

          <div className="mb-2">
            <div
              className={`flex items-center justify-between mb-3 px-2 py-1.5 cursor-pointer select-none rounded-[10px] transition-colors ${searchMode === "sxkd" ? "bg-amber-100 text-amber-900 border border-amber-200" : "hover:bg-slate-100 text-slate-500"}`}
              onClick={() => {
                if (searchMode === "sxkd") {
                  setIsSxkdExpanded(!isSxkdExpanded);
                } else {
                  setSearchMode("sxkd");
                  setIsSxkdExpanded(true);
                  setIsDtxdExpanded(false);
                  setActivePanes((prev) => {
                    if (
                      prev.includes("luatDienLuc") ||
                      prev.includes("nd18") ||
                      prev.includes("tt42")
                    )
                      return prev.filter(
                        (x) =>
                          x === "luatDienLuc" || x === "nd18" || x === "tt42",
                      );
                    return ["luatDienLuc"];
                  });
                }
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${searchMode === "sxkd" ? "bg-amber-500" : "bg-slate-300"}`}
                />
                <h2 className="text-xs font-bold uppercase tracking-wider">
                  Công tác SXKD
                </h2>
              </div>
              {searchMode === "sxkd" && (
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ${isSxkdExpanded ? "rotate-180" : ""}`}
                />
              )}
            </div>

            <div
              className={`space-y-4 transition-all duration-300 ${searchMode === "sxkd" && isSxkdExpanded ? "opacity-100 h-auto" : "opacity-0 h-0 overflow-hidden pointer-events-none"}`}
            >
              <div className="space-y-1">
                <button
                  onClick={() => setShowLegalBasisSXKD(!showLegalBasisSXKD)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-all group ${
                    showLegalBasisSXKD
                      ? "bg-white text-ink-900 shadow-xl shadow-ink-900/5 ring-1 ring-ink-900/5"
                      : "bg-white/50 border border-ink-900/5 hover:bg-white hover:shadow-md text-ink-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2 rounded-lg transition-colors bg-cream-100 text-ink-900`}
                    >
                      <Scale size={20} strokeWidth={1.5} />
                    </div>
                    <span
                      className={`font-bold transition-all ${showLegalBasisSXKD ? "text-sm" : "text-xs"}`}
                    >
                      Pháp lý
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ${showLegalBasisSXKD ? "rotate-180 text-slate-400" : "text-slate-300"}`}
                  />
                </button>
                <AnimatePresence>
                  {showLegalBasisSXKD && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 space-y-4 bg-white rounded-2xl mt-1 border border-ink-900/5 shadow-sm">
                        <ul className="space-y-4">
                          {[
                            "Luật Điện lực số 61/2024/QH15",
                            "Thông tư 42/2022/TT-BCT (Đã hợp nhất TT 56/2025/TT-BCT)",
                            "Nghị định số 18/2025/NĐ-CP",
                          ].map((law, idx) => (
                            <li key={idx} className="flex gap-3 items-start">
                              <div className="mt-2 w-1.5 h-1.5 rounded-full bg-deep-yellow shrink-0" />
                              <span className="text-xs text-ink-900 font-medium leading-snug italic">
                                {law}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="h-px bg-ink-900/5 mx-2 my-2" />

              {/* Luật Điện Lực Section */}
              <div className="space-y-1">
                <button
                  onClick={() => setIsDlSidebarExpanded(!isDlSidebarExpanded)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-all group ${
                    isDlSidebarExpanded
                      ? "bg-white text-ink-900 shadow-xl shadow-ink-900/5 ring-1 ring-ink-900/5"
                      : "bg-white/50 border border-ink-900/5 hover:bg-white hover:shadow-md text-ink-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2 rounded-lg transition-colors bg-cream-100 text-ink-900`}
                    >
                      <Zap size={20} strokeWidth={1.5} />
                    </div>
                    <span
                      className={`font-bold transition-all ${isDlSidebarExpanded ? "text-sm" : "text-xs"}`}
                    >
                      Luật Điện lực
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ${isDlSidebarExpanded ? "rotate-180 text-slate-400" : "text-slate-300"}`}
                  />
                </button>

                <AnimatePresence>
                  {isDlSidebarExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-2 pr-0 pt-2 pb-10">
                        {(() => {
                          const allDlChapters = luatDienLucData.chapters.map(
                            (ch) => ch.id,
                          );
                          const isAllDlSelected =
                            allDlChapters.length > 0 &&
                            allDlChapters.every((id) =>
                              selectedDlIds.includes(id),
                            );

                          const filteredDlChapters = effectiveDlSearch
                            ? luatDienLucData.chapters.filter(
                                (ch) =>
                                  ch.title
                                    .toLowerCase()
                                    .includes(
                                      effectiveDlSearch.toLowerCase(),
                                    ) ||
                                  getChapterArticles(ch).some(
                                    (a: any) =>
                                      a.title
                                        .toLowerCase()
                                        .includes(
                                          effectiveDlSearch.toLowerCase(),
                                        ) ||
                                      (a.content &&
                                        a.content
                                          .toLowerCase()
                                          .includes(
                                            effectiveDlSearch.toLowerCase(),
                                          )),
                                  ),
                              )
                            : luatDienLucData.chapters;

                          return (
                            <div className="space-y-1">
                              <button
                                onClick={() =>
                                  handleSelectDl(
                                    isAllDlSelected ? [] : allDlChapters,
                                  )
                                }
                                className="w-full text-left px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest text-deep-yellow-dark hover:bg-deep-yellow/5 mb-1 flex items-center gap-2"
                              >
                                <Filter size={10} />
                                {isAllDlSelected
                                  ? "Bỏ chọn tất cả"
                                  : "Chọn tất cả chương"}
                              </button>

                              {filteredDlChapters.map((chapter) => {
                                const isSelected = selectedDlIds.includes(
                                  chapter.id,
                                );
                                return (
                                  <div key={chapter.id} className="mb-1.5">
                                    <button
                                      onClick={() => handleSelectDl(chapter.id)}
                                      className={`w-full text-left pr-8 pl-2 py-2 rounded-xl text-[11px] transition-all duration-300 flex items-center gap-2 group relative ${
                                        isSelected && !effectiveDlSearch
                                          ? "bg-yellow-400 text-slate-900 font-bold shadow-md shadow-yellow-400/40"
                                          : "text-ink-800 hover:bg-ink-900/5 font-semibold"
                                      }`}
                                    >
                                      <span className="text-[11px] tracking-tight leading-snug whitespace-normal break-words py-0.5">
                                        {chapter.title.split(":")[0] || chapter.title}
                                      </span>
                                      <div
                                        className="absolute right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-black/10 rounded-md text-slate-500 hover:text-blue-700"
                                        onClick={(e) =>
                                          handleScrollTo(
                                            e,
                                            "luatDienLuc",
                                            "chapter",
                                            chapter.id,
                                          )
                                        }
                                        title="Chuyển đến"
                                      >
                                        <Target size={14} />
                                      </div>
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-1 mt-2">
                <button
                  onClick={() =>
                    setIsNd18SidebarExpanded(!isNd18SidebarExpanded)
                  }
                  className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-all group ${
                    isNd18SidebarExpanded
                      ? "bg-white text-ink-900 shadow-xl shadow-ink-900/5 ring-1 ring-ink-900/5"
                      : "bg-white/50 border border-ink-900/5 hover:bg-white hover:shadow-md text-ink-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2 rounded-lg transition-colors bg-cream-100 text-ink-900`}
                    >
                      <FileText size={20} strokeWidth={1.5} />
                    </div>
                    <span
                      className={`font-bold transition-all ${isNd18SidebarExpanded ? "text-sm" : "text-xs"}`}
                    >
                      Nghị định 18
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ${isNd18SidebarExpanded ? "rotate-180 text-slate-400" : "text-slate-300"}`}
                  />
                </button>

                <AnimatePresence>
                  {isNd18SidebarExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-2 pr-0 pt-2 pb-10">
                        {(() => {
                          const allNd18Chapters = nghiDinh18Data.chapters.map(
                            (ch) => ch.id,
                          );
                          const isAllNd18Selected =
                            allNd18Chapters.length > 0 &&
                            allNd18Chapters.every((id) =>
                              selectedNd18Ids.includes(id),
                            );

                          const filteredNd18Chapters = effectiveNd18Search
                            ? nghiDinh18Data.chapters.filter(
                                (ch) =>
                                  ch.title
                                    .toLowerCase()
                                    .includes(
                                      effectiveNd18Search.toLowerCase(),
                                    ) ||
                                  getChapterArticles(ch).some(
                                    (a: any) =>
                                      a.title
                                        .toLowerCase()
                                        .includes(
                                          effectiveNd18Search.toLowerCase(),
                                        ) ||
                                      (a.content &&
                                        a.content
                                          .toLowerCase()
                                          .includes(
                                            effectiveNd18Search.toLowerCase(),
                                          )),
                                  ),
                              )
                            : nghiDinh18Data.chapters;

                          return (
                            <div className="space-y-1">
                              <button
                                onClick={() =>
                                  handleSelectNd18(
                                    isAllNd18Selected ? [] : allNd18Chapters,
                                  )
                                }
                                className="w-full text-left px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest text-deep-yellow-dark hover:bg-deep-yellow/5 mb-1 flex items-center gap-2"
                              >
                                <Filter size={10} />
                                {isAllNd18Selected
                                  ? "Bỏ chọn tất cả"
                                  : "Chọn tất cả chương"}
                              </button>

                              {filteredNd18Chapters.map((chapter) => {
                                const isSelected = selectedNd18Ids.includes(
                                  chapter.id,
                                );
                                return (
                                  <div key={chapter.id} className="mb-1.5">
                                    <button
                                      onClick={() => handleSelectNd18(chapter.id)}
                                      className={`w-full text-left pr-8 pl-2 py-2 rounded-xl text-[11px] transition-all duration-300 flex items-center gap-2 group relative ${
                                        isSelected && !effectiveNd18Search
                                          ? "bg-yellow-400 text-slate-900 font-bold shadow-md shadow-yellow-400/40"
                                          : "text-ink-800 hover:bg-ink-900/5 font-semibold"
                                      }`}
                                    >
                                      <span className="text-[11px] tracking-tight leading-snug whitespace-normal break-words py-0.5">
                                        {chapter.title.split(":")[0] || chapter.title}
                                      </span>
                                      <div
                                        className="absolute right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-black/10 rounded-md text-slate-500 hover:text-blue-700"
                                        onClick={(e) =>
                                          handleScrollTo(
                                            e,
                                            "nd18",
                                            "chapter",
                                            chapter.id,
                                          )
                                        }
                                        title="Chuyển đến"
                                      >
                                        <Target size={14} />
                                      </div>
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {/* Thông tư 42 Section */}
              <div className="space-y-1 mt-2">
                <button
                  onClick={() =>
                    setIsTt42SidebarExpanded(!isTt42SidebarExpanded)
                  }
                  className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-all group ${
                    isTt42SidebarExpanded
                      ? "bg-white text-ink-900 shadow-xl shadow-ink-900/5 ring-1 ring-ink-900/5"
                      : "bg-white/50 border border-ink-900/5 hover:bg-white hover:shadow-md text-ink-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2 rounded-lg transition-colors bg-cream-100 text-ink-900`}
                    >
                      <BookOpen size={20} strokeWidth={1.5} />
                    </div>
                    <span
                      className={`font-bold transition-all ${isTt42SidebarExpanded ? "text-sm" : "text-xs"}`}
                    >
                      Thông tư 42
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ${isTt42SidebarExpanded ? "rotate-180 text-slate-400" : "text-slate-300"}`}
                  />
                </button>

                <AnimatePresence>
                  {isTt42SidebarExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-2 pr-0 pt-2 pb-10">
                        {(() => {
                          const allTt42Chapters = thongTu42Data.chapters.map(
                            (ch) => ch.id,
                          );
                          const isAllTt42Selected =
                            allTt42Chapters.length > 0 &&
                            allTt42Chapters.every((id) =>
                              selectedTt42Ids.includes(id),
                            );

                          const filteredTt42Chapters = effectiveTt42Search
                            ? thongTu42Data.chapters.filter(
                                (ch) =>
                                  ch.title
                                    .toLowerCase()
                                    .includes(
                                      effectiveTt42Search.toLowerCase(),
                                    ) ||
                                  getChapterArticles(ch).some(
                                    (a: any) =>
                                      a.title
                                        .toLowerCase()
                                        .includes(
                                          effectiveTt42Search.toLowerCase(),
                                        ) ||
                                      (a.content &&
                                        a.content
                                          .toLowerCase()
                                          .includes(
                                            effectiveTt42Search.toLowerCase(),
                                          )),
                                  ),
                              )
                            : thongTu42Data.chapters;

                          return (
                            <div className="space-y-1">
                              <button
                                onClick={() =>
                                  handleSelectTt42(
                                    isAllTt42Selected ? [] : allTt42Chapters,
                                  )
                                }
                                className="w-full text-left px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest text-deep-yellow-dark hover:bg-deep-yellow/5 mb-1 flex items-center gap-2"
                              >
                                <Filter size={10} />
                                {isAllTt42Selected
                                  ? "Bỏ chọn tất cả"
                                  : "Chọn tất cả chương"}
                              </button>

                              {filteredTt42Chapters.map((chapter) => {
                                const isSelected = selectedTt42Ids.includes(
                                  chapter.id,
                                );
                                return (
                                  <div key={chapter.id} className="mb-1.5">
                                    <button
                                      onClick={() => handleSelectTt42(chapter.id)}
                                      className={`w-full text-left pr-8 pl-2 py-2 rounded-xl text-[11px] transition-all duration-300 flex items-center gap-2 group relative ${
                                        isSelected && !effectiveTt42Search
                                          ? "bg-yellow-400 text-slate-900 font-bold shadow-md shadow-yellow-400/40"
                                          : "text-ink-800 hover:bg-ink-900/5 font-semibold"
                                      }`}
                                    >
                                      <span className="text-[11px] tracking-tight leading-snug whitespace-normal break-words py-0.5">
                                        {chapter.title.split(":")[0] || chapter.title}
                                      </span>
                                      <div
                                        className="absolute right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-black/10 rounded-md text-slate-500 hover:text-blue-700"
                                        onClick={(e) =>
                                          handleScrollTo(
                                            e,
                                            "tt42",
                                            "chapter",
                                            chapter.id,
                                          )
                                        }
                                        title="Chuyển đến"
                                      >
                                        <Target size={14} />
                                      </div>
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="h-px bg-ink-900/5 mx-2 my-2" />

          {/* Bookmarks Section */}
          <div className="space-y-1">
            <button
              onClick={() => setIsBookmarksExpanded(!isBookmarksExpanded)}
              className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-all group ${
                isBookmarksExpanded
                  ? "bg-white text-ink-900 shadow-xl shadow-ink-900/5 ring-1 ring-ink-900/5"
                  : "bg-white/50 border border-ink-900/5 hover:bg-white hover:shadow-md text-ink-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-lg transition-colors bg-cream-100 text-rose-500`}
                >
                  <Bookmark size={16} fill="currentColor" />
                </div>
                <span
                  className={`font-bold transition-all ${isBookmarksExpanded ? "text-sm" : "text-xs"}`}
                >
                  Đã lưu ({bookmarks.length})
                </span>
              </div>
              <ChevronDown
                size={16}
                className={`transition-transform duration-300 ${isBookmarksExpanded ? "rotate-180 text-slate-400" : "text-slate-300"}`}
              />
            </button>

            <AnimatePresence>
              {isBookmarksExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pl-4 pr-0 pt-2 pb-1 space-y-2">
                    {bookmarks.length > 0 ? (
                      bookmarks.map((b) => (
                        <div
                          key={b.articleId}
                          className="flex items-start gap-2 group"
                        >
                          <button
                            onClick={() => {
                              let docId = b.docId as
                                | "luat"
                                | "nd214"
                                | "tt79"
                                | "luatDienLuc"
                                | "nd18"
                                | "tt42";

                              const bmSearchMode =
                                docId === "luatDienLuc" ||
                                docId === "nd18" ||
                                docId === "tt42"
                                  ? "sxkd"
                                  : "dtxd";
                              setSearchMode(bmSearchMode);
                              if (bmSearchMode === "sxkd") {
                                setIsSxkdExpanded(true);
                                setIsDtxdExpanded(false);
                              } else {
                                setIsDtxdExpanded(true);
                                setIsSxkdExpanded(false);
                              }

                              if (
                                searchQuery ||
                                searchQueryLuat ||
                                searchQueryNd ||
                                searchQueryTt ||
                                searchQueryDl ||
                                searchQueryNd18 ||
                                searchQueryTt42
                              ) {
                                setSearchQuery("");
                                setSearchQueryLuat("");
                                setSearchQueryNd("");
                                setSearchQueryTt("");
                                setSearchQueryDl("");
                                setSearchQueryNd18("");
                                setSearchQueryTt42("");
                              }

                              if (b.docId === "luat") {
                                handleSelectLuat([], b.articleId);
                              } else if (b.docId === "nd214") {
                                handleSelectNd([], b.articleId);
                              } else if (b.docId === "tt79") {
                                handleSelectTt([], b.articleId);
                              } else if (b.docId === "luatDienLuc") {
                                handleSelectDl([], b.articleId);
                              } else if (b.docId === "nd18") {
                                handleSelectNd18([], b.articleId);
                              } else if (b.docId === "tt42") {
                                handleSelectTt42([], b.articleId);
                              }
                            }}
                            className="flex-1 text-left py-1.5 px-2 rounded-xl hover:bg-white border border-transparent hover:border-ink-900/5 hover:shadow-sm transition-all"
                          >
                            <div className="text-[9px] uppercase font-black tracking-widest text-slate-400 mb-0.5">
                              {b.docId === "luat"
                                ? "Luật ĐT"
                                : b.docId === "nd214"
                                  ? "NĐ 214"
                                  : b.docId === "tt79"
                                    ? "TT 79"
                                    : b.docId === "luatDienLuc"
                                      ? "Luật ĐL"
                                      : b.docId === "nd18"
                                        ? "NĐ 18"
                                        : "TT 42"}
                            </div>
                            <div className="text-[11px] font-semibold text-ink-900 line-clamp-2 leading-snug">
                              {b.title}
                            </div>
                          </button>
                          <button
                            onClick={() =>
                              handleToggleBookmark(
                                b.articleId,
                                b.docId,
                                b.title,
                              )
                            }
                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg mt-1 transition-colors"
                            title="Xóa khỏi đã lưu"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="py-4 text-center">
                        <p className="text-xs italic text-slate-400">
                          Bạn chưa lưu điều luật nào.
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="h-px bg-ink-900/5 mx-2 my-2" />

          {/* Notes Section */}
          <div className="space-y-1">
            <button
              onClick={() => setIsNotesExpanded(!isNotesExpanded)}
              className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-all group ${
                isNotesExpanded
                  ? "bg-white text-ink-900 shadow-xl shadow-ink-900/5 ring-1 ring-ink-900/5"
                  : "bg-white/50 border border-ink-900/5 hover:bg-white hover:shadow-md text-ink-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-lg transition-colors bg-cream-100 text-deep-yellow`}
                >
                  <Pencil size={16} fill="currentColor" />
                </div>
                <span
                  className={`font-bold transition-all ${isNotesExpanded ? "text-sm" : "text-xs"}`}
                >
                  Ghi chú (
                  {userNotes.filter((n) => n.isPinned !== false).length})
                </span>
              </div>
              <ChevronDown
                size={16}
                className={`transition-transform duration-300 ${isNotesExpanded ? "rotate-180 text-slate-400" : "text-slate-300"}`}
              />
            </button>

            <AnimatePresence>
              {isNotesExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pl-4 pr-0 pt-2 pb-1 space-y-2">
                    {userNotes.filter((n) => n.isPinned !== false).length >
                    0 ? (
                      userNotes
                        .filter((n) => n.isPinned !== false)
                        .map((n) => (
                          <div
                            key={n.id}
                            className="flex items-start gap-2 group"
                          >
                            <button
                              onClick={() => {
                                let docId = "luat" as
                                  | "luat"
                                  | "nd214"
                                  | "tt79"
                                  | "luatDienLuc"
                                  | "nd18"
                                  | "tt42";
                                if (n.articleId.includes("nd214"))
                                  docId = "nd214";
                                if (n.articleId.includes("tt79"))
                                  docId = "tt79";
                                if (
                                  n.articleId.startsWith("dl-") ||
                                  n.articleId.includes("dl-D")
                                )
                                  docId = "luatDienLuc"; // dl prefix
                                if (n.articleId.includes("nd18"))
                                  docId = "nd18";
                                if (n.articleId.includes("tt42"))
                                  docId = "tt42";

                                const noteSearchMode =
                                  docId === "luatDienLuc" ||
                                  docId === "nd18" ||
                                  docId === "tt42"
                                    ? "sxkd"
                                    : "dtxd";
                                setSearchMode(noteSearchMode);
                                if (noteSearchMode === "sxkd") {
                                  setIsSxkdExpanded(true);
                                  setIsDtxdExpanded(false);
                                } else {
                                  setIsDtxdExpanded(true);
                                  setIsSxkdExpanded(false);
                                }

                                if (
                                  searchQuery ||
                                  searchQueryLuat ||
                                  searchQueryNd ||
                                  searchQueryTt ||
                                  searchQueryDl ||
                                  searchQueryNd18 ||
                                  searchQueryTt42
                                ) {
                                  setSearchQuery("");
                                  setSearchQueryLuat("");
                                  setSearchQueryNd("");
                                  setSearchQueryTt("");
                                  setSearchQueryDl("");
                                  setSearchQueryNd18("");
                                  setSearchQueryTt42("");
                                }

                                if (docId === "luat") {
                                  handleSelectLuat([], n.articleId, n.id);
                                } else if (docId === "nd214") {
                                  handleSelectNd([], n.articleId, n.id);
                                } else if (docId === "tt79") {
                                  handleSelectTt([], n.articleId, n.id);
                                } else if (docId === "luatDienLuc") {
                                  handleSelectDl([], n.articleId, n.id);
                                } else if (docId === "nd18") {
                                  handleSelectNd18([], n.articleId, n.id);
                                } else if (docId === "tt42") {
                                  handleSelectTt42([], n.articleId, n.id);
                                }
                              }}
                              className="flex-1 text-left py-1.5 px-2 rounded-xl hover:bg-white border border-transparent hover:border-ink-900/5 hover:shadow-sm transition-all"
                            >
                              <div className="flex items-center gap-1 mb-0.5">
                                <div
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{
                                    backgroundColor:
                                      n.color === "yellow"
                                        ? "#fef08a"
                                        : n.color === "green"
                                          ? "#bbf7d0"
                                          : n.color === "blue"
                                            ? "#bfdbfe"
                                            : n.color === "pink"
                                              ? "#fbcfe8"
                                              : n.color === "purple"
                                                ? "#e9d5ff"
                                                : "#fef08a",
                                  }}
                                />
                                <div className="text-[9px] uppercase font-black tracking-widest text-slate-400">
                                  {n.articleId.includes("luat") ||
                                  n.articleId.startsWith("LDT")
                                    ? "Luật ĐT"
                                    : n.articleId.includes("nd214")
                                      ? "NĐ 214"
                                      : n.articleId.includes("tt79")
                                        ? "TT 79"
                                        : n.articleId.includes("nd18")
                                          ? "NĐ 18"
                                          : n.articleId.includes("tt42")
                                            ? "TT 42"
                                            : "Luật ĐL"}
                                </div>
                              </div>
                              <div className="text-[11px] font-semibold text-ink-900 line-clamp-2 leading-snug">
                                {n.note || `"${n.text}"`}
                              </div>
                            </button>
                            <button
                              onClick={() => handleDeleteNote(n.id)}
                              className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg mt-1 transition-colors"
                              title="Xóa ghi chú"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))
                    ) : (
                      <div className="py-4 text-center">
                        <p className="text-xs italic text-slate-400">
                          Bạn chưa có ghi chú nào.
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        <div className="p-4 border-t border-ink-900/5 mt-auto flex flex-col gap-3">
          <button
            onClick={() => setShowQAModal(true)}
            className="w-full flex items-center justify-center gap-2 py-3 px-3 bg-white border border-ink-900/5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] text-ink-800 hover:bg-cream-50 transition-all shadow-sm hover:shadow-md"
          >
            <RobotIcon size={26} className="text-[#0f172a] drop-shadow-sm" />
            Hỏi đáp
          </button>
          <button
            onClick={() => setShowDocumentModal(true)}
            className="w-full flex items-center justify-center gap-2 py-3 px-3 bg-white border border-ink-900/5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] text-ink-800 hover:bg-cream-50 transition-all shadow-sm hover:shadow-md"
          >
            <FolderOpen size={18} fill="#facc15" stroke="currentColor" />
            Tài liệu
          </button>
          <button
            onClick={() => setShowDisclaimer(true)}
            className="w-full flex items-center justify-center gap-2 py-3 px-3 bg-white border border-ink-900/5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] text-ink-800 hover:bg-cream-50 transition-all shadow-sm hover:shadow-md"
          >
            <AlertCircle size={18} fill="#facc15" stroke="currentColor" />
            Miễn trừ
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="shrink-0 bg-cream-100 backdrop-blur-xl border-b border-ink-900/5 p-4 lg:py-4 lg:px-6 flex items-center gap-4 lg:gap-6 z-30 relative">
          {/* Decorative Snowflakes */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            {[...Array(24)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0.1, scale: 0.5 }}
                animate={{
                  opacity: [0.1, 0.3, 0.1],
                  scale: [1, 1.2, 1],
                  y: [0, 10, 0],
                }}
                transition={{
                  duration: Math.random() * 5 + 5,
                  repeat: Infinity,
                  ease: "linear",
                  delay: Math.random() * 5,
                }}
                className="absolute text-deep-yellow/20 blur-[0.5px]"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              >
                <Snowflake size={Math.random() * 15 + 10} strokeWidth={1.5} />
              </motion.div>
            ))}
          </div>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-3 bg-white border border-ink-900/5 shadow-sm hover:shadow-md hover:bg-cream-50 rounded-2xl shrink-0 transition-all z-20 text-ink-900"
          >
            <Menu size={24} />
          </button>

          <div
            className={`flex-1 relative flex gap-3 z-10 transition-all duration-500 w-full max-w-4xl`}
          >
            <AutocompleteInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Tìm kiếm chương, điều, nội dung..."
              className="w-full pl-12 pr-6 py-2.5 bg-white border border-ink-900/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/20 focus:border-amber-400/50 transition-all text-sm shadow-sm text-ink-900 font-medium placeholder:text-slate-400"
              containerClassName="flex-1 group"
              iconSize={18}
              showClear={false}
              dark={false}
              searchMode={searchMode}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="bg-amber-400 hover:bg-amber-500 px-4 py-2 rounded-xl font-bold text-xs text-slate-900 transition-all flex items-center gap-1.5 shrink-0 shadow-md shadow-amber-400/20"
              >
                <ArrowLeft size={14} />
                <span className="hidden sm:inline">Xóa tìm kiếm</span>
              </button>
            )}
            {deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 px-4 py-2 rounded-xl font-bold text-xs text-white transition-all flex items-center gap-1.5 shrink-0 shadow-md shadow-emerald-500/20"
                title="Tải ứng dụng về máy"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Tải App</span>
              </button>
            )}
          </div>
        </header>

        {/* View Switcher */}
        <div className="flex items-center justify-center pt-2 pb-1 lg:pt-3 lg:pb-0 shrink-0 z-20">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1.5 rounded-xl shadow-lg overflow-x-auto no-scrollbar max-w-full mx-4 lg:mx-0">
            <button
              onClick={() => togglePane("luat")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border ${activePanes.includes("luat") ? "bg-amber-400 border-transparent text-slate-900 shadow-md shadow-amber-400/20" : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-slate-200"}`}
            >
              <Gavel
                size={16}
                strokeWidth={1.5}
                className={
                  activePanes.includes("luat")
                    ? "text-slate-900"
                    : "text-slate-400"
                }
              />
              Luật Đấu Thầu
            </button>
            <button
              onClick={() => togglePane("nd214")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border ${activePanes.includes("nd214") ? "bg-amber-400 border-transparent text-slate-900 shadow-md shadow-amber-400/20" : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-slate-200"}`}
            >
              <ClipboardCheck
                size={16}
                strokeWidth={1.5}
                className={
                  activePanes.includes("nd214")
                    ? "text-slate-900"
                    : "text-slate-400"
                }
              />
              Nghị định 214
            </button>
            <button
              onClick={() => togglePane("tt79")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border ${activePanes.includes("tt79") ? "bg-amber-400 border-transparent text-slate-900 shadow-md shadow-amber-400/20" : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-slate-200"}`}
            >
              <BookOpen
                size={16}
                strokeWidth={1.5}
                className={
                  activePanes.includes("tt79")
                    ? "text-slate-900"
                    : "text-slate-400"
                }
              />
              Thông tư 79
            </button>

            <div className="w-px h-6 bg-slate-700 mx-2"></div>

            <button
              onClick={() => togglePane("luatDienLuc")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border ${activePanes.includes("luatDienLuc") ? "bg-amber-400 border-transparent text-slate-900 shadow-md shadow-amber-400/20" : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-slate-200"}`}
            >
              <Zap
                size={16}
                strokeWidth={1.5}
                className={
                  activePanes.includes("luatDienLuc")
                    ? "text-slate-900"
                    : "text-slate-400"
                }
              />
              Luật Điện lực
            </button>
            <button
              onClick={() => togglePane("nd18")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border ${activePanes.includes("nd18") ? "bg-amber-400 border-transparent text-slate-900 shadow-md shadow-amber-400/20" : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-slate-200"}`}
            >
              <FileText
                size={16}
                strokeWidth={1.5}
                className={
                  activePanes.includes("nd18")
                    ? "text-slate-900"
                    : "text-slate-400"
                }
              />
              Nghị định 18
            </button>
            <button
              onClick={() => togglePane("tt42")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border ${activePanes.includes("tt42") ? "bg-amber-400 border-transparent text-slate-900 shadow-md shadow-amber-400/20" : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-slate-200"}`}
            >
              <BookOpen
                size={16}
                strokeWidth={1.5}
                className={
                  activePanes.includes("tt42")
                    ? "text-slate-900"
                    : "text-slate-400"
                }
              />
              Thông tư 42
            </button>
          </div>
        </div>

        {/* Triple Panes */}
        <div
          className={`flex-1 flex overflow-hidden z-10 gap-0 lg:gap-4 px-0 pb-0 ${isSidebarOpen ? "lg:px-4 lg:pb-4 pt-2" : "lg:px-8 lg:pb-8 pt-2 lg:pt-3"} transition-all duration-500 ease-in-out flex-col lg:flex-row relative mx-auto w-full max-w-[1920px]`}
        >
          {activePanes.length === 0 ? (
            <div className="flex-1 flex items-center justify-center bg-white/50 backdrop-blur-sm lg:rounded-2xl border border-white/20">
              <div className="text-center p-8 max-w-md">
                <div className="w-16 h-16 bg-deep-yellow/10 text-deep-yellow-dark rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen size={32} strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-bold text-ink-900 mb-2">
                  Chưa chọn văn bản nào
                </h3>
                <p className="text-slate-500 text-sm">
                  Vui lòng chọn ít nhất một văn bản ở thanh công cụ phía trên để
                  xem nội dung hoặc nhập từ khóa tìm kiếm.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Left Pane: Luật đấu thầu */}
              <AnimatePresence mode="wait">
                {activePanes.includes("luat") && (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className={`flex-1 min-w-0 h-full relative lg:rounded-2xl flex flex-col min-h-[50vh] lg:min-h-0 lg:border lg:border-white/10 lg:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] bg-slate-900 ${activePanes.length === 1 ? "max-w-full" : ""}`}
                  >
                    <div className="bg-slate-800/90 backdrop-blur py-3 px-4 lg:px-6 border-b border-white/5 font-bold text-white flex items-center justify-between gap-4 z-20 lg:rounded-t-2xl">
                      <div className="flex items-center gap-2 shrink-0">
                        <Gavel
                          size={18}
                          strokeWidth={1.5}
                          className="text-amber-400"
                        />
                        <span className="hidden sm:inline">Luật Đấu Thầu</span>
                      </div>
                      <AutocompleteInput
                        value={searchQueryLuat}
                        onChange={setSearchQueryLuat}
                        placeholder="Tìm trong Luật..."
                        className="w-full pl-9 pr-8 py-1.5 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all text-xs shadow-sm text-white font-normal placeholder:text-slate-500"
                        containerClassName="flex-1 max-w-sm group"
                        iconSize={14}
                        dark={true}
                      />
                    </div>
                    <div className="flex-1 overflow-hidden relative lg:rounded-b-2xl">
                      <DocumentPane
                        docData={DOCUMENTS[0]}
                        allArticles={allLawArticles}
                        selectedIds={selectedLuatIds}
                        expandedArticleId={expandedLuatArticleId}
                        searchQuery={effectiveLuatSearch}
                        onSelect={handleSelectLuat}
                        onToggleArticle={(id) =>
                          setExpandedLuatArticleId((prev) =>
                            prev === id ? null : id,
                          )
                        }
                        onClearSearch={() => {
                          setSearchQueryLuat("");
                          setSearchQuery("");
                        }}
                        isSidebarOpen={isSidebarOpen}
                        bookmarkedIds={bookmarks.map((b) => b.articleId)}
                        onToggleBookmark={(id, title) =>
                          handleToggleBookmark(id, "luat", title)
                        }
                        userNotes={userNotes}
                        onNoteClick={(text, articleId, noteId) =>
                          setNoteDraft({
                            articleId,
                            text,
                            noteId,
                            noteContent: userNotes.find((n) => n.id === noteId)
                              ?.note,
                            color: userNotes.find((n) => n.id === noteId)
                              ?.color,
                            isPinned: userNotes.find((n) => n.id === noteId)
                              ?.isPinned,
                          })
                        }
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Right Pane: Nghị định 214 */}
              <AnimatePresence mode="wait">
                {activePanes.includes("nd214") && (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className={`flex-1 min-w-0 h-full relative lg:rounded-2xl flex flex-col min-h-[50vh] lg:min-h-0 bg-slate-900 lg:border lg:border-white/10 lg:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] ${activePanes.length === 1 ? "max-w-full" : ""}`}
                  >
                    <div className="bg-slate-800/90 backdrop-blur py-3 px-4 lg:px-6 border-b border-white/5 font-bold text-white flex items-center justify-between gap-4 z-20 lg:rounded-t-2xl">
                      <div className="flex items-center gap-2 shrink-0">
                        <ClipboardCheck
                          size={18}
                          strokeWidth={1.5}
                          className="text-amber-400"
                        />
                        <span className="hidden sm:inline">Nghị định 214</span>
                      </div>
                      <AutocompleteInput
                        value={searchQueryNd}
                        onChange={setSearchQueryNd}
                        placeholder="Tìm trong Nghị định..."
                        className="w-full pl-9 pr-8 py-1.5 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all text-xs shadow-sm text-white font-normal placeholder:text-slate-500"
                        containerClassName="flex-1 max-w-sm group"
                        iconSize={14}
                        dark={true}
                      />
                    </div>
                    <div className="flex-1 overflow-hidden relative lg:rounded-b-2xl">
                      <DocumentPane
                        docData={nghiDinh214Data}
                        allArticles={allNd214Articles}
                        selectedIds={selectedNdIds}
                        expandedArticleId={expandedNdArticleId}
                        searchQuery={effectiveNdSearch}
                        onSelect={handleSelectNd}
                        onToggleArticle={(id) =>
                          setExpandedNdArticleId((prev) =>
                            prev === id ? null : id,
                          )
                        }
                        onClearSearch={() => {
                          setSearchQueryNd("");
                          setSearchQuery("");
                        }}
                        isSidebarOpen={isSidebarOpen}
                        bookmarkedIds={bookmarks.map((b) => b.articleId)}
                        onToggleBookmark={(id, title) =>
                          handleToggleBookmark(id, "nd214", title)
                        }
                        userNotes={userNotes}
                        onNoteClick={(text, articleId, noteId) =>
                          setNoteDraft({
                            articleId,
                            text,
                            noteId,
                            noteContent: userNotes.find((n) => n.id === noteId)
                              ?.note,
                            color: userNotes.find((n) => n.id === noteId)
                              ?.color,
                            isPinned: userNotes.find((n) => n.id === noteId)
                              ?.isPinned,
                          })
                        }
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Right Pane: Thông tư 79 */}
              <AnimatePresence mode="wait">
                {activePanes.includes("tt79") && (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className={`flex-1 min-w-0 h-full relative lg:rounded-2xl flex flex-col min-h-[50vh] lg:min-h-0 bg-slate-900 lg:border lg:border-white/10 lg:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] ${activePanes.length === 1 ? "max-w-full" : ""}`}
                  >
                    <div className="bg-slate-800/90 backdrop-blur py-3 px-4 lg:px-6 border-b border-white/5 font-bold text-white flex items-center justify-between gap-4 z-20 lg:rounded-t-2xl">
                      <div className="flex items-center gap-2 shrink-0">
                        <BookOpen
                          size={18}
                          strokeWidth={1.5}
                          className="text-amber-400"
                        />
                        <span className="hidden sm:inline">Thông tư 79</span>
                      </div>
                      <AutocompleteInput
                        value={searchQueryTt}
                        onChange={setSearchQueryTt}
                        placeholder="Tìm trong Thông tư..."
                        className="w-full pl-9 pr-8 py-1.5 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all text-xs shadow-sm text-white font-normal placeholder:text-slate-500"
                        containerClassName="flex-1 max-w-sm group"
                        iconSize={14}
                        dark={true}
                      />
                    </div>
                    <div className="flex-1 overflow-hidden relative lg:rounded-b-2xl">
                      <DocumentPane
                        docData={thongTu79Data}
                        allArticles={allTt79Articles}
                        selectedIds={selectedTtIds}
                        expandedArticleId={expandedTtArticleId}
                        searchQuery={effectiveTtSearch}
                        onSelect={handleSelectTt}
                        onToggleArticle={(id) =>
                          setExpandedTtArticleId((prev) =>
                            prev === id ? null : id,
                          )
                        }
                        onClearSearch={() => {
                          setSearchQueryTt("");
                          setSearchQuery("");
                        }}
                        isSidebarOpen={isSidebarOpen}
                        bookmarkedIds={bookmarks.map((b) => b.articleId)}
                        onToggleBookmark={(id, title) =>
                          handleToggleBookmark(id, "tt79", title)
                        }
                        userNotes={userNotes}
                        onNoteClick={(text, articleId, noteId) =>
                          setNoteDraft({
                            articleId,
                            text,
                            noteId,
                            noteContent: userNotes.find((n) => n.id === noteId)
                              ?.note,
                            color: userNotes.find((n) => n.id === noteId)
                              ?.color,
                            isPinned: userNotes.find((n) => n.id === noteId)
                              ?.isPinned,
                          })
                        }
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pane: Luật Điện Lực */}
              <AnimatePresence mode="wait">
                {activePanes.includes("luatDienLuc") && (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className={`flex-1 min-w-0 h-full relative lg:rounded-2xl flex flex-col min-h-[50vh] lg:min-h-0 bg-slate-900 lg:border lg:border-white/10 lg:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] ${activePanes.length === 1 ? "max-w-full" : ""}`}
                  >
                    <div className="bg-slate-800/90 backdrop-blur py-3 px-4 lg:px-6 border-b border-white/5 font-bold text-white flex items-center justify-between gap-4 z-20 lg:rounded-t-2xl">
                      <div className="flex items-center gap-2 shrink-0">
                        <Zap
                          size={18}
                          strokeWidth={1.5}
                          className="text-amber-400"
                        />
                        <span className="hidden sm:inline">Luật Điện lực</span>
                      </div>
                      <AutocompleteInput
                        value={searchQueryDl}
                        onChange={setSearchQueryDl}
                        placeholder="Tìm trong Luật Điện lực..."
                        className="w-full pl-9 pr-8 py-1.5 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all text-xs shadow-sm text-white font-normal placeholder:text-slate-500"
                        containerClassName="flex-1 max-w-sm group"
                        iconSize={14}
                        dark={true}
                      />
                    </div>
                    <div className="flex-1 overflow-hidden relative lg:rounded-b-2xl">
                      <DocumentPane
                        docData={luatDienLucData}
                        allArticles={allDlArticles}
                        selectedIds={selectedDlIds}
                        expandedArticleId={expandedDlArticleId}
                        searchQuery={effectiveDlSearch}
                        onSelect={handleSelectDl}
                        onToggleArticle={(id) =>
                          setExpandedDlArticleId((prev) =>
                            prev === id ? null : id,
                          )
                        }
                        onClearSearch={() => {
                          setSearchQueryDl("");
                          setSearchQuery("");
                        }}
                        isSidebarOpen={isSidebarOpen}
                        bookmarkedIds={bookmarks.map((b) => b.articleId)}
                        onToggleBookmark={(id, title) =>
                          handleToggleBookmark(id, "luatDienLuc", title)
                        }
                        userNotes={userNotes}
                        onNoteClick={(text, articleId, noteId) =>
                          setNoteDraft({
                            articleId,
                            text,
                            noteId,
                            noteContent: userNotes.find((n) => n.id === noteId)
                              ?.note,
                            color: userNotes.find((n) => n.id === noteId)
                              ?.color,
                            isPinned: userNotes.find((n) => n.id === noteId)
                              ?.isPinned,
                          })
                        }
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pane: Nghị định 18 */}
              <AnimatePresence mode="wait">
                {activePanes.includes("nd18") && (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className={`flex-1 min-w-0 h-full relative lg:rounded-2xl flex flex-col min-h-[50vh] lg:min-h-0 bg-slate-900 lg:border lg:border-white/10 lg:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] ${activePanes.length === 1 ? "max-w-full" : ""}`}
                  >
                    <div className="bg-slate-800/90 backdrop-blur py-3 px-4 lg:px-6 border-b border-white/5 font-bold text-white flex items-center justify-between gap-4 z-20 lg:rounded-t-2xl">
                      <div className="flex items-center gap-2 shrink-0">
                        <FileText
                          size={18}
                          strokeWidth={1.5}
                          className="text-amber-400"
                        />
                        <span className="hidden sm:inline">Nghị định 18</span>
                      </div>
                      <AutocompleteInput
                        value={searchQueryNd18}
                        onChange={setSearchQueryNd18}
                        placeholder="Tìm trong Nghị định 18..."
                        className="w-full pl-9 pr-8 py-1.5 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all text-xs shadow-sm text-white font-normal placeholder:text-slate-500"
                        containerClassName="flex-1 max-w-sm group"
                        iconSize={14}
                        dark={true}
                      />
                    </div>
                    <div className="flex-1 overflow-hidden relative lg:rounded-b-2xl">
                      <DocumentPane
                        docData={nghiDinh18Data}
                        allArticles={allNd18Articles}
                        selectedIds={selectedNd18Ids}
                        expandedArticleId={expandedNd18ArticleId}
                        searchQuery={effectiveNd18Search}
                        onSelect={handleSelectNd18}
                        onToggleArticle={(id) =>
                          setExpandedNd18ArticleId((prev) =>
                            prev === id ? null : id,
                          )
                        }
                        onClearSearch={() => {
                          setSearchQueryNd18("");
                          setSearchQuery("");
                        }}
                        isSidebarOpen={isSidebarOpen}
                        bookmarkedIds={bookmarks.map((b) => b.articleId)}
                        onToggleBookmark={(id, title) =>
                          handleToggleBookmark(id, "nd18", title)
                        }
                        userNotes={userNotes}
                        onNoteClick={(text, articleId, noteId) =>
                          setNoteDraft({
                            articleId,
                            text,
                            noteId,
                            noteContent: userNotes.find((n) => n.id === noteId)
                              ?.note,
                            color: userNotes.find((n) => n.id === noteId)
                              ?.color,
                            isPinned: userNotes.find((n) => n.id === noteId)
                              ?.isPinned,
                          })
                        }
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pane: Thông tư 42 */}
              <AnimatePresence mode="wait">
                {activePanes.includes("tt42") && (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className={`flex-1 min-w-0 h-full relative lg:rounded-2xl flex flex-col min-h-[50vh] lg:min-h-0 bg-slate-900 lg:border lg:border-white/10 lg:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] ${activePanes.length === 1 ? "max-w-full" : ""}`}
                  >
                    <div className="bg-slate-800/90 backdrop-blur py-3 px-4 lg:px-6 border-b border-white/5 font-bold text-white flex items-center justify-between gap-4 z-20 lg:rounded-t-2xl">
                      <div className="flex items-center gap-2 shrink-0">
                        <BookOpen
                          size={18}
                          strokeWidth={1.5}
                          className="text-amber-400"
                        />
                        <span className="hidden sm:inline">Thông tư 42</span>
                      </div>
                      <AutocompleteInput
                        value={searchQueryTt42}
                        onChange={setSearchQueryTt42}
                        placeholder="Tìm trong Thông tư 42..."
                        className="w-full pl-9 pr-8 py-1.5 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all text-xs shadow-sm text-white font-normal placeholder:text-slate-500"
                        containerClassName="flex-1 max-w-sm group"
                        iconSize={14}
                        dark={true}
                      />
                    </div>
                    <div className="flex-1 overflow-hidden relative lg:rounded-b-2xl">
                      <DocumentPane
                        docData={thongTu42Data}
                        allArticles={allTt42Articles}
                        selectedIds={selectedTt42Ids}
                        expandedArticleId={expandedTt42ArticleId}
                        searchQuery={effectiveTt42Search}
                        onSelect={handleSelectTt42}
                        onToggleArticle={(id) =>
                          setExpandedTt42ArticleId((prev) =>
                            prev === id ? null : id,
                          )
                        }
                        onClearSearch={() => {
                          setSearchQueryTt42("");
                          setSearchQuery("");
                        }}
                        isSidebarOpen={isSidebarOpen}
                        bookmarkedIds={bookmarks.map((b) => b.articleId)}
                        onToggleBookmark={(id, title) =>
                          handleToggleBookmark(id, "tt42", title)
                        }
                        userNotes={userNotes}
                        onNoteClick={(text, articleId, noteId) =>
                          setNoteDraft({
                            articleId,
                            text,
                            noteId,
                            noteContent: userNotes.find((n) => n.id === noteId)
                              ?.note,
                            color: userNotes.find((n) => n.id === noteId)
                              ?.color,
                            isPinned: userNotes.find((n) => n.id === noteId)
                              ?.isPinned,
                          })
                        }
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>

      {/* Disclaimer Modal */}
      <AnimatePresence>
        {showDisclaimer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDisclaimer(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl mx-4"
            >
              <button
                onClick={() => setShowDisclaimer(false)}
                className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
              <div className="w-12 h-12 mx-auto bg-amber-100 text-slate-800 rounded-2xl flex items-center justify-center mb-5">
                <AlertCircle size={24} fill="#facc15" stroke="currentColor" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-4 tracking-tight text-center">
                Miễn trừ
              </h2>
              <div className="text-slate-600 leading-relaxed text-[13px] text-justify italic space-y-2.5 font-medium px-1">
                <p>
                  • Dữ liệu được trích xuất nguyên bản từ hệ thống văn bản pháp
                  luật hiện hành. Tuy nhiên, ứng dụng chỉ mang tính chất hỗ trợ
                  tra cứu nhanh.
                </p>
                <p>
                  • Chúng tôi không chịu trách nhiệm đối với bất kỳ thiệt hại
                  hoặc hệ quả pháp lý nào phát sinh từ việc người dùng tự ý ra
                  quyết định dựa trên thông tin tại đây.
                </p>
                <p>
                  • Để đảm bảo tính pháp lý tuyệt đối khi áp dụng vào thực tế,
                  vui lòng đối chiếu với văn bản chính thức được ban hành bởi cơ
                  quan Nhà nước có thẩm quyền.
                </p>
              </div>
              <button
                onClick={() => setShowDisclaimer(false)}
                className="mt-6 w-full bg-slate-900 text-white rounded-xl py-2.5 text-sm font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
              >
                Tôi đã hiểu
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Document Modal */}
      <AnimatePresence>
        {showDocumentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDocumentModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl mx-4 text-center"
            >
              <button
                onClick={() => setShowDocumentModal(false)}
                className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
              <div className="w-12 h-12 mx-auto bg-amber-100 text-slate-800 rounded-2xl flex items-center justify-center mb-5">
                <FolderOpen size={24} fill="#facc15" stroke="currentColor" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-4 tracking-tight">
                Tài liệu
              </h2>
              <div className="text-slate-600 leading-relaxed text-[14px] flex flex-col items-center space-y-4 font-medium px-1">
                <p>
                  Tải tài liệu tại:{" "}
                  <a
                    href="https://drive.google.com/drive/folders/1LZq_bi3N-0ymBm1veG84-wzK_TNVbXg5?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Google Drive
                  </a>
                </p>
                <p>Hoặc quét mã QR bên dưới:</p>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <QRCodeSVG
                    value="https://drive.google.com/drive/folders/1LZq_bi3N-0ymBm1veG84-wzK_TNVbXg5?usp=sharing"
                    size={160}
                    imageSettings={{
                      src: "https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg",
                      x: undefined,
                      y: undefined,
                      height: 32,
                      width: 32,
                      excavate: true,
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QA Modal */}
      <AnimatePresence>
        {showQAModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQAModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white/95 backdrop-blur-sm rounded-3xl p-6 pt-12 md:p-8 md:pt-14 max-w-[700px] w-full shadow-2xl mx-4 overflow-hidden"
            >
              <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.06]"
                style={{ backgroundImage: 'url("/bg-notebook.png")' }}
              />
              <button
                onClick={() => setShowQAModal(false)}
                className="absolute right-4 top-4 md:right-5 md:top-5 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-colors z-20"
              >
                <X size={18} />
              </button>

              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 text-center md:text-left">
                  <div className="w-[100px] h-[100px] mx-auto md:mx-0 bg-gradient-to-b from-[#fef08a] to-[#fde047] p-[4px] rounded-[2.2rem] mb-6 relative shadow-sm">
                    <div className="w-full h-full bg-[#fef9c3] rounded-[2rem] flex items-center justify-center">
                      <div className="absolute inset-0 border-4 border-white/50 rounded-[2.2rem] pointer-events-none" />
                      <RobotIcon
                        size={80}
                        className="text-[#0f172a] drop-shadow-sm"
                      />
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">
                    Trợ lý AI
                  </h2>
                  <p className="text-slate-500 text-[14px] leading-relaxed text-justify">
                    Khám phá tính năng hỏi đáp thông minh được cung cấp bởi
                    Google NotebookLM. Trợ lý AI có khả năng giải đáp các thắc
                    mắc chuyên sâu, tư vấn trong việc xử lý tình huống và giúp bạn 
                    hiểu rõ hơn về Pháp luật chuyên ngành.
                  </p>
                </div>

                <div className="w-full md:w-[280px] shrink-0 space-y-3 flex flex-col items-center">
                  <a
                    href="https://notebooklm.google.com/notebook/139ef39b-d491-4c80-ae9d-4d4d502d23b0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-1 w-full py-3 px-4 bg-[#0f172a] text-white rounded-xl hover:bg-[#1e293b] transition-all shadow-md group border border-slate-700"
                  >
                    <span className="font-bold text-[15px] text-yellow-400 flex items-center gap-1.5">
                      Mở NotebookLM{" "}
                      <ExternalLink
                        size={16}
                        className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                      />
                    </span>
                    <span className="text-[12px] font-medium text-slate-400">
                      Trợ lý AI về Luật Đấu Thầu
                    </span>
                  </a>

                  <a
                    href="https://notebooklm.google.com/notebook/80054c02-0ab0-4391-a412-974f7c1c9a47"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-1 w-full py-3 px-4 bg-[#0f172a] text-white rounded-xl hover:bg-[#1e293b] transition-all shadow-md group border border-slate-700"
                  >
                    <span className="font-bold text-[15px] text-yellow-400 flex items-center gap-1.5">
                      Mở NotebookLM{" "}
                      <ExternalLink
                        size={16}
                        className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                      />
                    </span>
                    <span className="text-[12px] font-medium text-slate-400 text-center">
                      Trợ lý AI hướng dẫn mẫu hồ sơ Đấu thầu
                    </span>
                  </a>

                  <a
                    href="https://notebooklm.google.com/notebook/79d26a87-0bfa-4ee1-9f69-467065085ae5"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-1 w-full py-3 px-4 bg-[#0f172a] text-white rounded-xl hover:bg-[#1e293b] transition-all shadow-md group border border-slate-700"
                  >
                    <span className="font-bold text-[15px] text-yellow-400 flex items-center gap-1.5">
                      Mở NotebookLM{" "}
                      <ExternalLink
                        size={16}
                        className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                      />
                    </span>
                    <span className="text-[12px] font-medium text-slate-400 text-center">
                      Trợ lý AI về Quy chế EVNHCMC
                    </span>
                  </a>

                  <a
                    href="https://notebooklm.google.com/notebook/e615e141-73fe-4cf2-9f5f-f0ee74214dcb"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-1 w-full py-3 px-4 bg-[#0f172a] text-white rounded-xl hover:bg-[#1e293b] transition-all shadow-md group border border-slate-700"
                  >
                    <span className="font-bold text-[15px] text-yellow-400 flex items-center gap-1.5">
                      Mở NotebookLM{" "}
                      <ExternalLink
                        size={16}
                        className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                      />
                    </span>
                    <span className="text-[12px] font-medium text-slate-400 text-center">
                      Trợ lý AI về Pháp lý SXKD
                    </span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {selectionMenu && (
        <div
          className="fixed z-[90] selection-menu-ignore shadow-2xl rounded-full px-3 py-2 bg-[#0f172a] text-white flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200 border border-white/10"
          style={{
            top: selectionMenu.top,
            left: selectionMenu.left,
            transform: "translateX(-50%)",
          }}
        >
          <div className="flex items-center gap-2.5">
            {[
              { id: "yellow", hex: "#fef08a" },
              { id: "green", hex: "#bbf7d0" },
              { id: "blue", hex: "#bfdbfe" },
              { id: "pink", hex: "#fbcfe8" },
              { id: "purple", hex: "#e9d5ff" },
            ].map((c, i) => (
              <button
                key={c.id}
                onClick={() => {
                  handleSaveNote({
                    id: Date.now().toString(),
                    articleId: selectionMenu.articleId,
                    text: selectionMenu.text,
                    note: "",
                    color: c.id,
                    isPinned: false,
                  });
                  setSelectionMenu(null);
                  window.getSelection()?.removeAllRanges();
                }}
                className={`w-[26px] h-[26px] rounded-full transition-all hover:scale-110 border-[3px] border-[#0f172a] ring-2 ${i === 0 ? "ring-[#fef08a]/60" : "ring-transparent hover:ring-white/30"}`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
          <div className="w-[1px] h-5 bg-white/20 ml-0.5 mr-0.5"></div>
          <button
            onClick={() => {
              setNoteDraft({
                articleId: selectionMenu.articleId,
                text: selectionMenu.text,
                color: "yellow",
              });
              setSelectionMenu(null);
              window.getSelection()?.removeAllRanges();
            }}
            className="flex items-center gap-2 pr-2 pl-0.5 hover:text-white/80 transition-colors text-sm font-semibold text-white whitespace-nowrap"
          >
            <Pencil size={15} />
            Ghi chú
          </button>
        </div>
      )}

      {globalTooltip && (
        <div
          className="fixed z-[100] translate-x-[-50%] translate-y-[-100%] pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-300"
          style={{ top: globalTooltip.top, left: globalTooltip.left }}
        >
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 text-pink-700 text-[13px] p-3 rounded-2xl shadow-xl shadow-pink-500/20 border-2 border-pink-200 relative px-4 font-bold flex items-center gap-2 leading-tight w-max max-w-xs">
            <MessageCircleHeart
              size={18}
              className="shrink-0 -mt-0.5 text-pink-500"
            />
            <span className="whitespace-pre-wrap">{globalTooltip.content}</span>
            <div
              className="absolute top-full -mt-[2px] border-[8px] border-transparent border-t-pink-200"
              style={{
                left: `calc(50% + ${globalTooltip.arrowOffset}px)`,
                transform: "translateX(-50%)",
              }}
            />
            <div
              className="absolute top-full -mt-[5px] border-[8px] border-transparent border-t-pink-100"
              style={{
                left: `calc(50% + ${globalTooltip.arrowOffset}px)`,
                transform: "translateX(-50%)",
              }}
            />
          </div>
        </div>
      )}

      <NoteModal
        isOpen={!!noteDraft}
        onClose={() => setNoteDraft(null)}
        initialData={noteDraft}
        onSave={handleSaveNote}
        onDelete={handleDeleteNote}
      />
    </div>
  );
}
