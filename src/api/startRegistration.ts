import { apiClient } from "./apiConfig";

// match the shape of profile_pic in your JSON
export interface ProfilePic {
  access: string;
  path: string;
  name: string;
  type: string;
  size: number;
  mime: string;
  meta: {
    width: number;
    height: number;
  };
  url: string;
}

export interface StudentProfile {
  id: number;
  full_name: string;
  Status: string;
  user_id: number;
  parent_user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  send_texts: boolean;
  dob: string | null;
  gender: string;
  school: string;
  grade: string;
  health: string;
  emergency_first_name: string;
  emergency_last_name: string;
  emergency_phone: string;
  emergency_email: string;
  emergency_relationship: string;
  dismissal_names: string;
  independent_travel: boolean;
  family_involved: string;
  photo_release: boolean;
  created_at: number;
  profile_pic: ProfilePic | null;
}

export interface SessionProduct {
  id: number;
  Product_name: string;
  Annual_price_id?: string;
  Monthly_price_id?: string;
  Semester_price_id?: string;
  Single_sale_price_id?: string;
  Displayed_annual_price?: string;
  Displayed_monthly_price?: string;
  Displayed_semester_price?: string;
  Displayed_single_sale_price?: string;
  Annual_price_amount: number;
  Monthly_price_amount: number;
  Semester_price_amount: number;
  Single_sale_price_amount: number;
}

export interface ProgramInfo {
  id: number;
  name: string;
  Add_On_Program: boolean;
  // reflect the 1st_Semester_Start_Date field in your payload
  "1st_Semester_Start_Date": number;
}

export interface Session {
  id: number;
  Name: string;
  Weekday: string;
  Time_block: string;
  Start_Date: string | null;
  End_Date: string | null;
  Location: number;
  Tuition_product: number;
  Deposit_product: number;
  program: ProgramInfo;
  tuition_product: SessionProduct;
  deposit_product: SessionProduct;
  workshop?: {
    id: number;
    Name: string;
  };
}

export interface StartRegistrationResponse {
  student_profiles: StudentProfile[];
  sessions: Session[];
  has_active_subscription: boolean;
  pending_students?: StudentProfile[];
}

export async function startRegistration(
  payload: any
): Promise<StartRegistrationResponse> {
  try {
    const response = await apiClient
      .post<StartRegistrationResponse>("/registration/start_registration", payload)
      .fetch();

    if (response.has_active_subscription) {
      // navigate away if they already have an active subscription
      window.location.assign("/dashboard/registration/manage-subscription");
      // optionally return here if you don’t want calling code to keep running:
      // return response;
    }

    return response;
  } catch (error) {
    console.error("Error starting registration:", error);
    throw error;
  }
}