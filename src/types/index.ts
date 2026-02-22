export type PageType = 'landing' | 'product';

export type DeviceType = 'desktop' | 'tablet' | 'mobile';

export type TemplatePreset = 'minimalist' | 'bold' | 'luxury' | 'playful';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface GeneratedCode {
  componentCode: string;
  cssCode: string;
  title: string;
}

export interface PageVersion {
  versionId: string;
  versionNumber: number;
  label: string;
  html: string;
  generatedCode: GeneratedCode;
  prompt: string;
  createdAt: number;
}

export interface GeneratedPage {
  id: string;
  title: string;
  pageType: PageType;
  description: string;
  html: string;
  generatedCode?: GeneratedCode;
  createdAt: number;
  updatedAt: number;
  versions?: PageVersion[];
}

export interface DesignVariant {
  id: string;
  label: string;
  style: string;
  html: string;
  generatedCode: GeneratedCode;
  pageData: GeneratedPageData;
}

export interface GenerateRequest {
  messages: Message[];
  pageType: PageType;
  referenceUrl?: string;
  preset?: TemplatePreset;
}

export interface GenerateResponse {
  html: string;
  generatedCode?: GeneratedCode;
  error?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Shell-based page data models
// These mirror the props used by the shell components in src/shells.
// ─────────────────────────────────────────────────────────────────────────────

// NavBar shell
export interface NavBarLink {
  label: string;
  href: string;
}

export interface NavBarData {
  logo: string;
  links: NavBarLink[];
  ctaLabel: string;
  accentColor: string;
}

// Hero shell
export interface HeroData {
  headline: string;
  subheadline: string;
  primaryCta: string;
  secondaryCta: string;
  backgroundImage?: string;
}

// Features shell
export interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

export interface FeaturesSectionData {
  sectionLabel: string;
  heading: string;
  features: FeatureItem[];
}

// Pricing shell
export interface PricingTierData {
  name: string;
  price: string;
  period: string;
  features: string[];
  ctaLabel: string;
  highlighted: boolean;
}

export interface PricingSectionData {
  sectionLabel: string;
  heading: string;
  tiers: PricingTierData[];
}

// Testimonials shell
export interface TestimonialItem {
  quote: string;
  name: string;
  role: string;
  avatar: string;
}

export interface TestimonialsSectionData {
  sectionLabel: string;
  heading: string;
  testimonials: TestimonialItem[];
}

// CTA banner shell
export interface CTABannerData {
  headline: string;
  subtext: string;
  ctaLabel: string;
}

// Footer shell
export interface FooterColumnLink {
  label: string;
  href: string;
}

export interface FooterColumnData {
  heading: string;
  links: FooterColumnLink[];
}

export interface FooterData {
  logo: string;
  columns: FooterColumnData[];
  copyright: string;
}

// Product section shell
export interface ProductSectionData {
  title: string;
  description: string;
  price: string;
  originalPrice: string;
  images: string[];
  colors: string[];
  sizes: string[];
  ctaLabel?: string; // main buy/add-to-cart button label
}

export interface ProductReviewItemData {
  name: string;
  avatar: string;
  rating: number; // 1-5
  title: string;
  text: string;
}

export interface ProductReviewsSectionData {
  heading: string;
  summaryText: string;
  averageRating: number;
  reviewCount: number;
  reviews: ProductReviewItemData[];
}

export interface RelatedProductItemData {
  title: string;
  image: string;
  price: string;
}

export interface RelatedProductsSectionData {
  heading: string;
  items: RelatedProductItemData[];
}

export interface FaqItemData {
  question: string;
  answer: string;
}

export interface FaqSectionData {
  heading: string;
  items: FaqItemData[];
}

export interface StatsItemData {
  label: string;
  value: string;
}

export interface StatsSectionData {
  heading: string;
  items: StatsItemData[];
}

export interface NewsletterSectionData {
  heading: string;
  subtext: string;
  placeholder: string;
  buttonLabel: string;
}

export interface TeamMemberData {
  name: string;
  role: string;
  bio: string;
  avatar: string;
}

export interface TeamSectionData {
  heading: string;
  members: TeamMemberData[];
}

export interface LogoBarSectionData {
  heading: string;
  logos: string[];
}

// Full landing & product page data models
export interface LandingPageData {
  nav: NavBarData;
  hero: HeroData;
  features: FeaturesSectionData;
  pricing: PricingSectionData;
  testimonials: TestimonialsSectionData;
  faq?: FaqSectionData;
  stats?: StatsSectionData;
  newsletter?: NewsletterSectionData;
  team?: TeamSectionData;
  logoBar?: LogoBarSectionData;
  ctaBanner: CTABannerData;
  footer: FooterData;
}

export interface ProductPageData {
  nav: NavBarData;
  productSection: ProductSectionData;
  reviews?: ProductReviewsSectionData;
  relatedProducts?: RelatedProductsSectionData;
  footer?: FooterData;
}

export interface GeneratedPageData {
  pageType: PageType;
  title: string;
  preset?: TemplatePreset;
  landing?: LandingPageData;
  product?: ProductPageData;
}

export interface AppState {
  messages: Message[];
  currentHtml: string;
  currentCode: GeneratedCode | null;
  pageType: PageType;
  referenceUrl: string;
  preset: TemplatePreset;
  isLoading: boolean;
  activeTab: 'preview' | 'code';
  device: DeviceType;
  currentPageId: string | null;
  // Per-page-type stored results
  landingHtml?: string;
  landingCode?: GeneratedCode | null;
  landingPageData?: GeneratedPageData | null;
  productHtml?: string;
  productCode?: GeneratedCode | null;
  productPageData?: GeneratedPageData | null;
  variants?: DesignVariant[];
  selectedVariant?: string | null;
  isGeneratingVariants?: boolean;
}