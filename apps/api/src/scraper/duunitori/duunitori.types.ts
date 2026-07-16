export interface DuunitoriJob {
  heading: string;
  date_posted: string;
  slug: string;
  municipality_name: string;
  export_image_url: string;
  company_name: string;
  descr: string;
  latitude: number;
  longitude: number;
}

export interface DuunitoriResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: DuunitoriJob[];
}
