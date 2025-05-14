// src/modules/tickets/components/urlParamNavigator.ts

import {
  saveSelectedProduction,
  saveSelectedPerformance,
  clearTicketPurchaseState,
} from "../state/ticketPurchaseState";
import { initializeProductionList } from "../productionList";
import { initializePerformanceList } from "../performanceList";
import { initializeTicketTiers } from "../ticketTiers";
import { WFSlider } from "@xatom/slider";
import {
  initializeTicketSidebarIndicators,
  setActiveTicketStep,
  markTicketStepAsCompleted,
} from "../components/sidebarIndicators";
import { WFComponent } from "@xatom/core";
import { updateSelectedPerformanceUI } from "../components/selectedPerformanceUI";
import { apiClient } from "../../../api/apiConfig";

// parse URL params
const getUrlParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    productionId: params.get("production"),   // string | null
    performanceId: params.get("performance"), // string | null
    cancelId: params.get("cancel"),           // string | null
  };
};

export const initializeStateFromUrlParams = async (slider: WFSlider) => {
  const { productionId, performanceId, cancelId } = getUrlParams();
  initializeTicketSidebarIndicators();

  const loadingWall = new WFComponent(".loading_wall");
  const animationDuration = 500;

  if (productionId || performanceId || cancelId) {
    loadingWall.setStyle({ display: "flex" });

    try {
      // handle cancellation
      if (cancelId) {
        const req = apiClient.delete(`/tickets/cancel_order/${cancelId}`);
        await new Promise<void>((resolve, reject) => {
          req.onData(() => {
            // remove cancel from URL
            const ps = new URLSearchParams(window.location.search);
            ps.delete("cancel");
            const base = window.location.pathname;
            const qs = ps.toString();
            window.history.replaceState({}, document.title, base + (qs ? `?${qs}` : ""));
            resolve();
          });
          req.onError((err) => reject(err));
          req.fetch();
        });
      }

      // if we have a productionId, pick step-1 → step-2
      if (productionId) {
        clearTicketPurchaseState();

        // load & render productions
        const productions = await initializeProductionList("#selectProductionList");

        // find by numeric id
        const prod = productions.find((p) => p.id === Number(productionId));
        if (prod) {
          saveSelectedProduction({
            id: prod.id,
            name: prod.Name,
            description: prod.Short_Description,
            imageUrl: prod.Main_Image,
          });

          markTicketStepAsCompleted(1);
          setActiveTicketStep(2);

          // check the radio in the UI
          const inp = document.querySelector<HTMLInputElement>(
            `input[value="${productionId}"]`
          );
          if (inp) {
            inp.checked = true;
            inp.dispatchEvent(new Event("change"));
          }

          // now load performances for that production
          const performances = await initializePerformanceList("#selectPerformanceList");

          // if URL has performanceId, pick step-2 → step-3
          if (performanceId) {
            const perf = performances.find((x) => x.id.toString() === performanceId);
            if (perf) {
              saveSelectedPerformance({
                id: perf.id.toString(),
                name: perf.Displayed_Name,
                dateTime: perf.Date_Time.toString(),
                description: perf.Short_Description,
                imageUrl: perf.Main_Image,
                location: perf.location_details.Name,
              });

              markTicketStepAsCompleted(2);
              setActiveTicketStep(3);

              updateSelectedPerformanceUI();
              await initializeTicketTiers("#bundleList", "#ticketTierList");
              slider.goToIndex(2);
            } else {
              console.error(`Performance ${performanceId} not found`);
              slider.goToIndex(1);
            }
          } else {
            slider.goToIndex(1);
          }
        } else {
          console.error(`Production ${productionId} not found`);
          slider.goToIndex(0);
        }
      } else {
        // no production param: stay on step-1
        slider.goToIndex(0);
      }
    } catch (err) {
      console.error("Error initializing from URL:", err);
      slider.goToIndex(0);
    } finally {
      loadingWall.addCssClass("hidden");
      setTimeout(() => loadingWall.setStyle({ display: "none" }), animationDuration);
    }
  }
};
