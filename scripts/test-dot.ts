const cat1 = "성장·자기계발";
const cat2 = "성장·자기계발";

console.log("cat1 codes:", [...cat1].map(c => c.charCodeAt(0).toString(16)));
console.log("cat2 codes:", [...cat2].map(c => c.charCodeAt(0).toString(16)));

const MAIN_CATEGORIES = [
    "마케팅 심리학",
    "인지·뇌과학",
    "마음챙김·치유",
    "성장·자기계발",
    "인간관계·사회",
    "일반 심리학"
];

const postTags = [
    "성장·자기계발" // from DB
];

console.log(MAIN_CATEGORIES.includes(postTags[0]));
