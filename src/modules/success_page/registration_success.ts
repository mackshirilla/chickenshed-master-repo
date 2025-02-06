// src/success_page/registration_success.ts

import { WFComponent } from "@xatom/core";
import { WFImage } from "@xatom/image";
import { apiClient } from "../../api/apiConfig";

// Define the structure of the new registration response
export interface RegistrationResponse {
  data: {
    id: number;
    status: string; // e.g. 'Active', 'Deposit Paid'
    subscription_type: string; // e.g. 'Annual', 'Pay-Per-Semester'
    program: Program;
    workshop: Workshop | null; // workshop may be null
    pending_students: boolean;
    coupon: string;
    deposit_amount: number;
    start_date: string | null; // Possibly null
    next_charge_date: string | null;
    next_charge_amount: number;
    next_invoice_id: string;
    stripe_subscription_id: string;
    user_id: number;
    contact_id: number;
    sale_id: number;
    cancellation_reason: string;
    created_at: number;
  };
}

// Define the Program interface
interface Program {
  id: number;
  name: string;
  slug: string;
  Collection_ID: string;
  Locale_ID: string;
  Item_ID: string;
  Created_On: string;
  Updated_On: string;
  Published_On: string;
  Main_Image: string;
  Main_Video: string;
  Subheading: string;
  Short_description: string;
  Age_range: string;
  Price_Description: string;
  Schedule_Description: string;
  Financial_Aid_Description: string;
  Accessibility_Description: string;
  Program_Overview_Description: string;
  Sort_Order: number;
  Color_Theme: number;
  Inquiry_Only: boolean;
  ["1st_Semester_Start_Date"]: number | null;
  ["2nd_Semester_Charge_Date"]: number | null;
  Subscription_Pause_Date: number | null;
  Success_Page_Message: string;
}

// Define the Workshop interface
interface Workshop {
  id: number;
  Name: string;
  Slug: string;
  Collection_ID: string;
  Locale_ID: string;
  Item_ID: string;
  Created_On: string | null;
  Updated_On: string | null;
  Published_On: string | null;
  Main_Image: string;
  Main_Video: string;
  Subheading: string;
  Short_description: string;
  Age_range: string;
  Price_Description: string;
  Schedule_Description: string;
  Financial_Aid_Description: string;
  Accessibility_Description: string;
  Workshop_Overview_Description: string;
  Success_Page_Message: string;
  Color_Theme: number;
  Parent_Program: number;
}

// Define a RegistrationCard component to manage the registration card DOM
class RegistrationCard {
  private card: WFComponent;
  private image: WFImage;
  private programName: WFComponent;
  private workshopName: WFComponent;
  private subscriptionType: WFComponent;
  private invoiceDate: WFComponent;
  private activePill: WFComponent;
  private depositPill: WFComponent;
  private successMessage: WFComponent;
  private programId: string; // We'll store the program id as a string

  constructor(cardId: string) {
    const cardElement = document.getElementById(cardId);
    if (!cardElement) {
      throw new Error(`Element with id '${cardId}' not found.`);
    }

    // Since #registrationCard is the link element, initialize it accordingly
    this.card = new WFComponent(cardElement);

    // Initialize child elements within the link
    this.image = new WFImage(
      this.card.getChildAsComponent("#cardRegistrationImage").getElement()
    );
    this.programName = this.card.getChildAsComponent("#cardProgramName");
    this.workshopName = this.card.getChildAsComponent("#cardWorkshopName");
    this.subscriptionType = this.card.getChildAsComponent(
      "#cardSubscriptionType"
    );
    this.invoiceDate = this.card.getChildAsComponent("#cardInvoiceDate");
    this.activePill = this.card.getChildAsComponent("#cardActivePill");
    this.depositPill = this.card.getChildAsComponent("#cardDepositPill");
    this.successMessage = new WFComponent("#successMessage");

    // Initialize programId to an empty string
    this.programId = "";

    // Log warnings if any essential child elements are missing
    if (!this.programName) {
      console.warn(
        "Element with id 'cardProgramName' not found within the registration card."
      );
    }
    if (!this.workshopName) {
      console.warn(
        "Element with id 'cardWorkshopName' not found within the registration card."
      );
    }
    if (!this.subscriptionType) {
      console.warn(
        "Element with id 'cardSubscriptionType' not found within the registration card."
      );
    }
    if (!this.invoiceDate) {
      console.warn(
        "Element with id 'cardInvoiceDate' not found within the registration card."
      );
    }
    if (!this.activePill) {
      console.warn(
        "Element with id 'cardActivePill' not found within the registration card."
      );
    }
    if (!this.depositPill) {
      console.warn(
        "Element with id 'cardDepositPill' not found within the registration card."
      );
    }
    if (!this.image) {
      console.warn(
        "Element with id 'cardRegistrationImage' not found within the registration card."
      );
    }
    if (!this.successMessage) {
      console.warn("Element with id 'successMessage' not found on the page.");
    }
  }

  // Method to populate the registration card with data
  populate(data: RegistrationResponse["data"]) {
    console.log("Populating registration card with data.");

    // Set Program ID (store as string for URL parameter)
    this.programId = data.program.id.toString();
    console.log("Program ID set to:", this.programId);

    // Set Program Name
    this.programName.setText(data.program.name);
    console.log("Set programName:", data.program.name);

    // Set Workshop Name (if workshop exists)
    const workshopName = data.workshop ? data.workshop.Name : "";
    this.workshopName.setText(workshopName);
    console.log("Set workshopName:", workshopName);

    // Set Subscription Type
    this.subscriptionType.setText(data.subscription_type);
    console.log("Set subscriptionType:", data.subscription_type);

    // Set Next Invoice Date (or show a fallback)
    const formattedDate = data.next_charge_date
      ? new Date(data.next_charge_date).toLocaleDateString()
      : "Upon Student Approval";
    this.invoiceDate.setText(formattedDate);
    console.log("Set invoiceDate:", formattedDate);

    // Determine the image and success message source
    // If there's a workshop, use the workshop fields; otherwise, use the program fields
    const imageUrl = data.workshop?.Main_Image || data.program.Main_Image;
    const successMessage =
      data.workshop?.Success_Page_Message || data.program.Success_Page_Message;

    // Set Registration Image
    if (imageUrl) {
      this.image.setImage(imageUrl);
      const imgElement = this.image.getElement() as HTMLImageElement;
      // No alt field is present in the new data; use a placeholder or the name
      imgElement.alt = data.workshop
        ? data.workshop.Name || "Chickenshed Workshop"
        : data.program.name || "Chickenshed Program";
      console.log("Set registration image URL and alt text.");
    }

    // Set Success Message
    if (successMessage) {
      this.successMessage.setHTML(successMessage);
      const successMessageElement = this.successMessage.getElement();
      successMessageElement.style.display = "block";
      console.log("Set and displayed success message.");
    }

    // Determine which status pill to display
    const status = data.status.toLowerCase();
    if (status === "active") {
      this.activePill.setText("Active");
      this.activePill.getElement().style.display = "block";
      this.depositPill.getElement().style.display = "none";
      console.log("Displayed Active pill.");
    } else if (status === "deposit paid") {
      this.depositPill.setText("Deposit Paid");
      this.depositPill.getElement().style.display = "block";
      this.activePill.getElement().style.display = "none";
      console.log("Displayed Deposit Paid pill.");
    } else {
      // Hide both pills if status doesn't match expected values
      this.activePill.getElement().style.display = "none";
      this.depositPill.getElement().style.display = "none";
      console.log("Hid both status pills.");
    }

    // Add the `program` parameter to the registration card link
    this.updateRegistrationLink();
  }

  // Method to update the registration link with the program parameter
  private updateRegistrationLink() {
    // Since #registrationCard is the link element, manipulate its href directly
    const registrationLinkElement = this.card.getElement() as HTMLAnchorElement;

    if (!registrationLinkElement) {
      console.warn("registrationCard element is not an anchor element.");
      return;
    }

    const currentHref = registrationLinkElement.getAttribute("href") || "#";
    console.log("Current href before update:", currentHref);

    try {
      const url = new URL(currentHref, window.location.origin);
      url.searchParams.set("program", this.programId);
      registrationLinkElement.setAttribute("href", url.toString());
      console.log(
        "Updated registration link with program parameter:",
        url.toString()
      );
    } catch (error) {
      console.error(
        "Invalid URL in registrationCard href:",
        currentHref,
        error
      );
    }
  }

  // Method to display the registration card
  show() {
    // Since #registrationCard is a link, ensure it's visible if it's hidden
    this.card.getElement().style.display = "block";
    console.log("Displayed registration card.");
  }
}

// Utility function to parse URL parameters
const getUrlParams = () => {
  const params = new URLSearchParams(window.location.search);
  const isRegistration = params.has("registration");
  const subscriptionId = params.get("subscription");
  return { isRegistration, subscriptionId };
};

// Main function to handle registration success
export const handleRegistrationSuccess = async () => {
  console.log("Handling registration success");
  const { isRegistration, subscriptionId } = getUrlParams();

  if (isRegistration && subscriptionId) {
    try {
      console.log("Fetching registration data...");
      // Make the GET request to fetch registration data
      const request = apiClient.get<RegistrationResponse>(
        `/success_page/registration/${subscriptionId}`
      );

      // Wrap the event-based response in a Promise for easier handling
      const registrationData: RegistrationResponse["data"] = await new Promise(
        (resolve, reject) => {
          request.onData((response) => {
            console.log("Registration data received:", response.data);
            resolve(response.data);
          });

          request.onError((error) => {
            console.error("API Error:", error);
            reject(error);
          });

          // Initiate the request
          request.fetch();
        }
      );

      // Trigger the success_trigger element (assuming it has an event listener)
      const successTrigger = document.querySelector(".success_trigger");
      if (successTrigger) {
        console.log("Triggering success_trigger element.");
        (successTrigger as HTMLElement).click();
      }

      // Initialize and populate the registration card
      const registrationCard = new RegistrationCard("registrationCard");
      registrationCard.populate(registrationData);
      registrationCard.show();
    } catch (error) {
      console.error("Error fetching registration data:", error);
      // Optionally, display an error message to the user
      const errorMessageElement = document.getElementById("errorMessage");
      if (errorMessageElement) {
        errorMessageElement.innerHTML = `
          <p>An error occurred while processing your registration.</p>
          <p>Please contact us for assistance.</p>
        `;
        errorMessageElement.style.display = "block";
        console.log("Displayed error message.");
      }
    }
  } else {
    console.log("Registration parameters not found in URL.");
  }
};
