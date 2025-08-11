export interface Course {
  course_id: number;
  subject_code: string;
  course_designation: string;
  full_course_designation: string;
  minimum_credits: number;
  maximum_credits: number;
  level: string;
  cumulative_gpa: number;
  most_recent_gpa: number;
  median_grade: string;
  a_percent: number;
  ab_percent: number;
  b_percent: number;
  bc_percent: number;
  c_percent: number;
  d_percent: number;
  f_percent: number;
  ethnic_studies: string | null;
  social_science: string | null;
  humanities: string | null;
  biological_science: string | null;
  physical_science: string | null;
  natural_science: string | null;
  literature: string | null;
  course_title: string;
  course_description: string | null;
  enrollment_prerequisites: string | null;
  sections: Section[];
  madgrades_course_uuid: string;
}

export interface Section {
  section_id: number;
  status: string;
  available_seats: number;
  waitlist_total: number;
  capacity: number;
  enrolled: number;
  meeting_time: string;
  location: string;
  instruction_mode: string;
  is_asynchronous: boolean;
  section_avg_rating: number;
  section_avg_difficulty: number;
  section_total_ratings: number;
  section_avg_would_take_again: number;
  instructors: Instructor[];
}

export interface Instructor {
  name: string;
  avg_rating: number;
  avg_difficulty: number;
  num_ratings: number;
  would_take_again_percent: number;
  rmp_instructor_id: string;
}

export interface ApiResponse {
  data: Course[];
  count: number;
  total_count: number;
  has_more: boolean;
  filters_applied: any;
}

export interface FilterState {
  search_param: string;
  status: string;
  min_available_seats: string;
  instruction_mode: string;
  limit: string;
  min_credits: string;
  max_credits: string;
  level: string;
  ethnic_studies: string;
  social_science: string;
  humanities: string;
  biological_science: string;
  physical_science: string;
  natural_science: string;
  literature: string;
  min_cumulative_gpa: string;
  min_most_recent_gpa: string;
  median_grade: string;
  min_a_percent: string;
  min_section_avg_rating: string;
  min_section_avg_difficulty: string;
  min_section_total_ratings: string;
  min_section_avg_would_take_again: string;
}