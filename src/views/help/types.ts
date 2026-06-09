export interface HelpCategory {
  id: string;
  title: string;
  i18nKey: string;
  icon: string;
  description: string;
  articleCount: number;
}

export interface HelpArticle {
  id: string;
  categoryId: string;
  title: string;
  summary: string;
  content: string;
  createdAt: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}
