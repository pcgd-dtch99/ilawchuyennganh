import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Insert helper
const helper = `
function getChapterArticles(chapter: any) {
  const articles: any[] = [];
  if (chapter.articles) articles.push(...chapter.articles);
  if (chapter.sections) {
    chapter.sections.forEach((s: any) => {
      if (s.articles) articles.push(...s.articles);
    });
  }
  return articles;
}
export default function App() {`;

content = content.replace('export default function App() {', helper);

// Fix filters
const sources = ['Luat', 'Nd', 'Tt', 'Dl', 'Nd18', 'Tt42'];

for (const key of sources) {
  content = content.replace(
    new RegExp(`\\(ch\\.articles\\?\\.some\\(\\(a: any\\) => a\\.title\\.toLowerCase\\(\\)\\.includes\\(effective${key}Search\\.toLowerCase\\(\\)\\) \\|\\| a\\.content\\.toLowerCase\\(\\)\\.includes\\(effective${key}Search\\.toLowerCase\\(\\)\\)\\)\\)`),
    `(getChapterArticles(ch).some((a: any) => a.title.toLowerCase().includes(effective${key}Search.toLowerCase()) || (a.content && a.content.toLowerCase().includes(effective${key}Search.toLowerCase()))))`
  );
  
  // Fix React rendering
  content = content.replaceAll(
`                                  {isSelected && chapter.articles && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="pl-3 space-y-0.5 overflow-hidden border-l border-ink-900/10 ml-4 py-1"
                                    >
                                      {chapter.articles.map((article: any) => (
                                        <button
                                          key={article.id}
                                          onClick={() => handleSelect${key}(chapter.id, article.id)}`,
`                                  {isSelected && getChapterArticles(chapter).length > 0 && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="pl-3 space-y-0.5 overflow-hidden border-l border-ink-900/10 ml-4 py-1"
                                    >
                                      {getChapterArticles(chapter).map((article: any) => (
                                        <button
                                          key={article.id}
                                          onClick={() => handleSelect${key}(chapter.id, article.id)}`
  );
}

fs.writeFileSync('src/App.tsx', content);
console.log('Fixed App.tsx sidebar renders');
