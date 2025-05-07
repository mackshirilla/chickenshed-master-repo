// src/manageSubscription/types.ts

/**
 * Represents a student's profile information.
 */
export interface StudentProfile {
  id: number;
  first_name: string;
  last_name: string;
}

/**
 * Represents a single registration item in the subscription management page.
 */
export interface RegistrationItem {
  id: number;
  status: string;
  student_id: number;
  program_id: number;
  workshop_id: number;
  session_id: number;
  program_details: {
    id: number;
    name: string;
  };
  workshop_details: {
    id: number;
    Name: string;
  };
  session_details: {
    id: number;
    Name: string;
    Weekday?: string;
    Time_block?: string;
    Tuition_product?: number;
    Deposit_product?: number;
    tuition_product?: Record<string, any>;
    deposit_product?: Record<string, any>;
  };
  student_profile: StudentProfile;
}

/**
 * Represents financial aid details for a subscription.
 */
export interface FinancialAid {
  id: number;
  status: string;
  selected_discount: number;
}

/**
 * Response from the manage-subscription API endpoint.
 */
export interface ManageSubscriptionResponse {
  id: number;
  subscription_name: string;
  status: string;
  subscription_type: string;
  update_subscription_type: string;
  user_id: number;
  contact_id: number;
  current_finaid_id: number;
  pending_students: boolean;
  early_registration: boolean;
  checkout_session_id: string;
  last_invoice_id: number | null;
  last_invoice_is_draft: boolean;
  stripe_subscription_id: string | null;
  coupon: string;
  deposit_amount: number;
  subscription_subtotal: number;
  subscription_total: number;
  subscription_amount_discount: number;
  created_at: number;
  cancellation_reason: string;
  invoice_history: any[];
  prorate_changes: boolean;
  charge_proration: string;
  free_trial_end: number | null;
  registrations: RegistrationItem[];
  /** Financial aid information, if applied */
  financial_aid?: FinancialAid;
}
