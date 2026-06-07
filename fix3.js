import fs from 'fs';

const ktc_search_1 = `<span className="inline-block relative text-[15px] pr-[20px] mx-[2px] leading-none">
                             A
                             <sup className="absolute top-[-0.4em] text-[9.5px] text-ink-500 font-normal leading-none" style={{ left: 'calc(100% + 1px)' }}>ktc</sup>
                             <sub className="absolute bottom-[-0.3em] text-[10px] font-bold leading-none" style={{ left: 'calc(100% + 1px)' }}>SDi</sub>
                           </span>`;

const ktc_rep_1 = `<span className="inline-flex items-center text-[15px] mx-[2px] relative top-[-1px]">
                             <span>A</span>
                             <span className="inline-flex flex-col justify-center ml-[1px]">
                               <span className="text-[9px] text-ink-500 font-normal leading-[1] mb-0.5">ktc</span>
                               <span className="text-[10px] font-bold leading-[1] mt-0.5">SDi</span>
                             </span>
                           </span>`;

const tc_search_1 = `<span className="inline-block relative text-[15px] pr-[18px] mx-[2px] leading-none">
                             A
                             <sup className="absolute top-[-0.4em] text-[9.5px] text-ink-500 font-normal leading-none" style={{ left: 'calc(100% + 1px)' }}>tc</sup>
                             <sub className="absolute bottom-[-0.3em] text-[10px] font-bold leading-none" style={{ left: 'calc(100% + 1px)' }}>SDi</sub>
                           </span>`;

const tc_rep_1 = `<span className="inline-flex items-center text-[15px] mx-[2px] relative top-[-1px]">
                             <span>A</span>
                             <span className="inline-flex flex-col justify-center ml-[1px]">
                               <span className="text-[9px] text-ink-500 font-normal leading-[1] mb-0.5">tc</span>
                               <span className="text-[10px] font-bold leading-[1] mt-0.5">SDi</span>
                             </span>
                           </span>`;

const ktc_search_2 = `<span key={i} className="inline-block relative text-[15px] pr-[20px] mx-[2px] leading-none">
                       A
                       <sup className="absolute top-[-0.4em] text-[9.5px] text-ink-500 font-normal leading-none" style={{ left: 'calc(100% + 1px)' }}>ktc</sup>
                       <sub className="absolute bottom-[-0.3em] text-[10px] font-bold leading-none" style={{ left: 'calc(100% + 1px)' }}>SDi</sub>
                     </span>`;

const ktc_rep_2 = `<span key={i} className="inline-flex items-center text-[15px] mx-[2px] relative top-[-1px]">
                       <span>A</span>
                       <span className="inline-flex flex-col justify-center ml-[1px]">
                         <span className="text-[9px] text-ink-500 font-normal leading-[1] mb-0.5">ktc</span>
                         <span className="text-[10px] font-bold leading-[1] mt-0.5">SDi</span>
                       </span>
                     </span>`;

const tc_search_2 = `<span key={i} className="inline-block relative text-[15px] pr-[18px] mx-[2px] leading-none">
                       A
                       <sup className="absolute top-[-0.4em] text-[9.5px] text-ink-500 font-normal leading-none" style={{ left: 'calc(100% + 1px)' }}>tc</sup>
                       <sub className="absolute bottom-[-0.3em] text-[10px] font-bold leading-none" style={{ left: 'calc(100% + 1px)' }}>SDi</sub>
                     </span>`;

const tc_rep_2 = `<span key={i} className="inline-flex items-center text-[15px] mx-[2px] relative top-[-1px]">
                       <span>A</span>
                       <span className="inline-flex flex-col justify-center ml-[1px]">
                         <span className="text-[9px] text-ink-500 font-normal leading-[1] mb-0.5">tc</span>
                         <span className="text-[10px] font-bold leading-[1] mt-0.5">SDi</span>
                       </span>
                     </span>`;
                                        

let text = fs.readFileSync('src/App.tsx', 'utf-8');
text = text.replaceAll(ktc_search_1, ktc_rep_1);
text = text.replaceAll(tc_search_1, tc_rep_1);
text = text.replaceAll(ktc_search_2, ktc_rep_2);
text = text.replaceAll(tc_search_2, tc_rep_2);
fs.writeFileSync('src/App.tsx', text);
