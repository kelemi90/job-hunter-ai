export interface TyomarkkinatoriJob {
  id: string;
  otsikko: string; // Title
  tyonantajanNimi: string; // Company name
  kunnat: string[]; // Municipalities
  kuvaus: string; // Description
  julkaisuaika: string; // Published date
  linkki: string; // Original URL
}

export interface TyomarkkinatoriResponse {
  jobPostings: TyomarkkinatoriJob[];
}
