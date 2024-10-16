import { WFRoute, navigate } from "@xatom/core";
import { validateUser } from "../auth/authServices";

export const app = () => {
  // Auth Routes
  new WFRoute("/create-account").execute(() => {
    import("../modules/forms/auth/signupForm").then(({ signupForm }) =>
      signupForm()
    );
  });

  new WFRoute("/login").execute(() => {
    import("../modules/forms/auth/loginForm").then(({ loginForm }) =>
      loginForm()
    );
  });

  new WFRoute("/create-account/magic-link").execute(() => {
    import("../modules/pages/magicLogin").then(({ magicLogin }) =>
      magicLogin()
    );
  });

  new WFRoute("/forgot-password").execute(() => {
    import("../modules/forms/auth/forgotPasswordForm").then(
      ({ forgotPasswordForm }) => forgotPasswordForm()
    );
  });

  new WFRoute("/create-account/reset-password").execute(async () => {
    try {
      const isValidUser = await validateUser();

      if (isValidUser) {
        import("../modules/forms/auth/resetPasswordForm").then(
          ({ passwordResetForm }) => passwordResetForm()
        );
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error validating user:", error);
    }
  });

  //--------------------------------//

  // Profile Routes
  new WFRoute("/create-account/complete-profile").execute(async () => {
    try {
      const isValidUser = await validateUser();

      if (isValidUser) {
        import(
          "../modules/forms/profiles/completeUserProfile/completeUserProfile"
        ).then(({ completeUserProfile }) => completeUserProfile());
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error validating user:", error);
    }
  });

  new WFRoute("/students/add-student").execute(async () => {
    try {
      const isValidUser = await validateUser();

      if (isValidUser) {
        import("../modules/forms/profiles/addStudentProfile/index").then(
          ({ addStudentProfile }) => addStudentProfile()
        );
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error validating user:", error);
    }
  });

  // student profile page
  new WFRoute("/dashboard/student/profile").execute(async () => {
    try {
      const isValidUser = await validateUser();

      if (isValidUser) {
        import("../modules/dashboard/studentProfile/index").then(
          ({ initializeStudentProfilePage }) => initializeStudentProfilePage()
        );
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error validating user:", error);
    }
  });

  // account details page
  new WFRoute("/dashboard/my-account").execute(async () => {
    try {
      const isValidUser = await validateUser();

      if (isValidUser) {
        import("../modules/dashboard/accountProfile/index").then(
          ({ initializeAccountDetailsPage }) => initializeAccountDetailsPage()
        );
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error validating user:", error);
    }
  });

  // Dashboard Routes
  new WFRoute("/dashboard").execute(async () => {
    try {
      const isValidUser = await validateUser();

      if (isValidUser) {
        import("../modules/dashboard/dashboard").then(({ dashboard }) =>
          dashboard()
        );
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error validating user:", error);
    }
  });

  new WFRoute("/dashboard/student-profiles").execute(async () => {
    try {
      const isValidUser = await validateUser();

      if (isValidUser) {
        import("../modules/dashboard/dashboardListStudents").then(
          ({ listStudentProfilesPage }) => listStudentProfilesPage()
        );
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error validating user:", error);
    }
  });

  new WFRoute("/dashboard/registrations").execute(async () => {
    try {
      const isValidUser = await validateUser();

      if (isValidUser) {
        import("../modules/dashboard/listRegistration").then(
          ({ initializeDynamicSubscriptionList }) =>
            initializeDynamicSubscriptionList("#listRegistration")
        );
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error validating user:", error);
    }
  });

  new WFRoute("/dashboard/ticket-orders").execute(async () => {
    try {
      const isValidUser = await validateUser();

      if (isValidUser) {
        import("../modules/dashboard/listTicketOrders").then(
          ({ initializeDynamicTicketOrderList }) =>
            initializeDynamicTicketOrderList("#listTickets")
        );
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error validating user:", error);
    }
  });

  new WFRoute("/dashboard/donations").execute(async () => {
    try {
      const isValidUser = await validateUser();

      if (isValidUser) {
        import("../modules/dashboard/listDonations").then(
          ({ initializeDynamicDonationList }) =>
            initializeDynamicDonationList("#listDonations")
        );
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error validating user:", error);
    }
  });

  // dashboard ticket order pages
  new WFRoute("/dashboard/ticket-order/ticket-order").execute(async () => {
    try {
      const isValidUser = await validateUser();

      if (isValidUser) {
        import("../modules/dashboard/ticketOrders/ticketOrderDetails").then(
          ({ initializeTicketOrderPage }) => initializeTicketOrderPage()
        );
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error validating user:", error);
    }
  });

  // dashboard registration pages
  //program details
  new WFRoute("/dashboard/registration/subscription").execute(async () => {
    try {
      const isValidUser = await validateUser();

      if (isValidUser) {
        import("../modules/dashboard/registration/programDetails").then(
          ({ initializeProgramDetailsPage }) => initializeProgramDetailsPage()
        );
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error validating user:", error);
    }
  });

  //workshop details
  new WFRoute("/dashboard/registration/subscription/workshop").execute(
    async () => {
      try {
        const isValidUser = await validateUser();

        if (isValidUser) {
          import("../modules/dashboard/registration/workshopDetails").then(
            ({ initializeWorkshopDetailsPage }) =>
              initializeWorkshopDetailsPage()
          );
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Error validating user:", error);
      }
    }
  );

  //session details
  new WFRoute("/dashboard/registration/subscription/session").execute(
    async () => {
      try {
        const isValidUser = await validateUser();

        if (isValidUser) {
          import("../modules/dashboard/registration/sessionDetails").then(
            ({ initializeSessionDetails }) => initializeSessionDetails()
          );
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Error validating user:", error);
      }
    }
  );

  // Registration Routes
  new WFRoute("/program-registration").execute(async () => {
    try {
      const isValidUser = await validateUser();

      if (isValidUser) {
        import("../modules/registration/programRegistration").then(
          ({ programRegistration }) => programRegistration()
        );
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error validating user:", error);
    }
  });

  // Ticket Purchase Routes
  new WFRoute("/purchase-tickets").execute(() => {
    import("../modules/tickets/makeTicketPurchase").then(
      ({ makeTicketPurchase }) => makeTicketPurchase()
    );
  });

  // Donation Routes
  new WFRoute("/make-a-donation").execute(() => {
    import("../modules/donate/makeDonation").then(({ makeDonation }) =>
      makeDonation()
    );
  });
};

// dashboard donation details
new WFRoute("/dashboard/donations/donation").execute(async () => {
  try {
    const isValidUser = await validateUser();

    if (isValidUser) {
      import("../modules/dashboard/donations/donationDetails").then(
        ({ initializeDonationDetailsPage }) => initializeDonationDetailsPage()
      );
    } else {
      navigate("/login");
    }
  } catch (error) {
    console.error("Error validating user:", error);
  }
});

// Success Page
new WFRoute("/success").execute(() => {
  import("../modules/success_page/index").then(({ initializeSuccessPage }) =>
    initializeSuccessPage()
  );
});
