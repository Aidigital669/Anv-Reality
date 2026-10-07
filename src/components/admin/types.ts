export interface HomepageSectionItem {
  id: string;
  orderNumber: string;
  title: string;
  tag: string;
  tagVariant?: 'default' | 'amber' | 'blue' | 'purple' | 'emerald';
  subtitle: string;
  isActive: boolean;
  type: string;
}

export interface MetricCardData {
  title: string;
  iconName: 'properties' | 'projects' | 'blogs' | 'enquiries' | 'reviews' | 'media';
  value: string;
  primaryStat?: {
    label: string;
    value: string;
    variant?: 'emerald' | 'amber' | 'zinc';
  };
  secondaryStat?: {
    label: string;
    value: string;
  };
  note?: string;
}

export interface PipelineItem {
  id: string;
  label: string;
  count: number;
  color: string;
}

export interface UploadedAsset {
  id: string;
  name: string;
  category: string;
  size: string;
  url: string;
  type: 'image' | 'video' | 'pdf';
  uploadedAt: string;
}
