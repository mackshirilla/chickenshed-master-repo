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
  // Route for /dashboard
new WFRoute("/dashboard").execute(async () => {
  try {
    const user = await validateUser();

    if (user) {
      switch (user.role) {
        case "USER":
          // Allow access to the user dashboard
          import("../modules/dashboard/dashboard").then(({ dashboard }) =>
            dashboard()
          );
          break;

        case "STUDENT":
          // Redirect STUDENT role to /student-dashboard
          console.warn(`STUDENT role detected. Redirecting to /student-dashboard.`);
          navigate("/student-dashboard");
          break;

        default:
          // For any other roles, redirect to /login or an appropriate page
          console.warn(`Unauthorized role: ${user.role}. Redirecting to /login.`);
          navigate("/login");
          break;
      }
    } else {
      // If the user is not valid, redirect to /login
      console.warn("Invalid user. Redirecting to /login.");
      navigate("/login");
    }
  } catch (error) {
    console.error("Error validating user:", error);
    // In case of an error during validation, redirect to /login
    navigate("/login");
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
  new WFRoute("/dashboard/ticket-order/performance").execute(async () => {
    console.log("ticket order")
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
  new WFRoute("/dashboard/registration/program").execute(async () => {
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
  new WFRoute("/dashboard/registration/workshop").execute(
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
  new WFRoute("/dashboard/registration/session").execute(
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
        import("../modules/registration_new/index").then(
          ({ newProgramRegistration }) => newProgramRegistration()
        );
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error validating user:", error);
    }
  });

  new WFRoute("/dashboard/registration/manage-subscription").execute(async () => {
    try {
      const isValidUser = await validateUser();

      if (isValidUser) {
        import("../modules/manageSubscription/index").then(
          ({ manageSubscriptionPage }) => manageSubscriptionPage()
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

//--------------------------------//
// Success Pages
new WFRoute("/checkout-success/registration").execute(() => {
  import("../modules/success_page/registration_success").then(({ handleRegistrationSuccessIndex }) =>
    handleRegistrationSuccessIndex()
  );
});

new WFRoute("/checkout-success/tickets").execute(() => {
  import("../modules/success_page/ticket_success").then(({ populateTicketSuccess }) =>
    populateTicketSuccess()
  );
});

new WFRoute("/checkout-success/donation").execute(() => {
  import("../modules/success_page/donation_success").then(({ handleDonationSuccess }) =>
    handleDonationSuccess()
  );
});



//--------------------------------//






//--------------------------------//
//student dashboard routes

//student dashboard

// Route for /student-dashboard
new WFRoute("/student-dashboard").execute(async () => {
  try {
    const user = await validateUser();

    if (user) {
      switch (user.role) {
        case "STUDENT":
          // Allow access to the student dashboard
          import("../modules/student_dashboard/studentDashboard").then(({ initializeStudentDashboard }) =>
            initializeStudentDashboard()
          );
          break;

        case "USER":
          // Redirect USER role to /dashboard
          navigate("/dashboard");
          break;

        default:
          // For any other roles, redirect to /login or an appropriate page
          console.warn(`Unauthorized role: ${user.role}. Redirecting to /login.`);
          navigate("/login");
          break;
      }
    } else {
      // If the user is not valid, redirect to /login
      navigate("/login");
    }
  } catch (error) {
    console.error("Error validating user:", error);
    // In case of an error during validation, redirect to /login
    navigate("/login");
  }
});
  

// Non Users
// Ticket Order Route for Unauthenticated Users
new WFRoute("/ticket-order").execute(() => {
  import("../modules/pages/ticketOrderNoLogin").then(({ initializeTicketOrderNoLoginPage }) =>
    initializeTicketOrderNoLoginPage()
  ).catch(error => {
    console.error("Error loading /ticket-order page:", error);
    navigate("/error"); // Optional: Redirect to an error page
  });
});


new WFRoute("/donation-details").execute(() => {
  import("../modules/dashboard/donations/donationDetails").then(({ initializeDonationDetailsPage }) =>
    initializeDonationDetailsPage()
  ).catch(error => {
    console.error("Error loading /ticket-order page:", error);
    navigate("/error"); // Optional: Redirect to an error page
  });
});
