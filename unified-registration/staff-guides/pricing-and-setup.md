# Program prices and setup

For the Chickenshed NYC team. Change a price, copy the right IDs, and connect the price to the right session. Prepared for review • November 5, 2026.


## Quick links

- [Open Products in Noloco](https://chickenshednyc.noloco.co/products)
- [Add a Product in Noloco](https://chickenshednyc.noloco.co/products/new)
- [Open Sessions in Noloco](https://chickenshednyc.noloco.co/sessions)
- [Open the family registration page](https://www.chickenshednyc.org/program-registration)
- [Open Stripe’s Product catalog](https://dashboard.stripe.com/products)

In Stripe, choose the Chickenshed NYC account. Use live mode for prices sold on the live website. Test-mode IDs will not work there.


## The short version


Stripe sets the amount charged. Noloco stores the IDs that tell the website which Stripe price to use. The Session tells the website which tuition and deposit products belong to that session.


Changing a dollar amount or a Displayed price field in Noloco alone does not change the Stripe charge. Changing Stripe’s default price alone does not replace the price ID saved in Noloco.


These steps change prices for new checkouts. They do not rewrite confirmed orders, update existing balances or change existing subscriptions.


## 1. Before changing a price

1. Decide the full tuition, whether semester payment and monthly arrangements are offered, and the deposit amount.
2. Open the Session in Noloco and note its Tuition_product and Deposit_product. Then open those Products and note the current IDs.
3. Check whether other sessions use the same product. If they do, changing that product’s price ID changes new checkouts for all of them. If only one session needs a different price, give that session a separate tuition product setup.

Treat saved changes as live. Keep a note of the old IDs so you can put them back if you make a mistake.


## 2. Set up the price in Stripe

1. Open Stripe’s Product catalog. Choose the existing tuition product, or choose Add product if this is a new offering.
2. Use a clear name identifying the program and session. A product Description can appear in checkout, so leave it blank if you do not want extra text below the product name.
3. Add the price. Choose One time, a fixed amount, and USD. Use this for full tuition, semester tuition and deposits. Do not choose Recurring for the new registration flow.
4. For a price change, add a new price for the new amount under the appropriate product. Keep the old prices intact for now.
5. Copy the Product ID beginning prod_. Then open the exact price you want and copy its Price ID beginning price_. Copy the whole ID, not the product name, page address or a payment-link address.

A product can have several prices. Check the amount and One time setting on the price you copy. A familiar product name is not enough to identify the right price.


## 3. Put the IDs into Noloco

1. Open Products. For a new setup, choose Add Product. For an existing product, open it and choose Edit.
2. Set Product Name clearly and Category to Registration. Paste the matching prod_ ID into Stripe Product ID.
3. For full tuition, paste the full-payment price_ ID into Stripe Single Sale Price ID. In an existing record, this field is called Single_sale_price.
4. Enter the matching amount in Single Sale Price Amount and a readable label in Displayed Single Sale Price. Enter dollars, such as 175.00 for $175, not 17500.
5. If semester payment is offered, paste its one-time price_ ID into Stripe Semester Price ID. On an existing record this is Semester_price. Set Semester Price Amount and Displayed Semester Price to match. For a new product with no semester option, leave the semester fields blank.
6. For a new product, choose Save. When editing an existing product, choose Done when finished. Reopen the record and check the IDs and amounts.

Every price on a tuition product must belong to the Stripe Product ID entered on that record. Do not paste a deposit price into the tuition product’s full-payment field.


Leave existing Annual_price, Monthly_price and their amount/display fields alone. They belong to the older subscription setup. New checkout does not use them. For a new product, do not fill them in to offer payment arrangements.


## 4. Set up or reuse the deposit

1. Look for the correct deposit in Products before making another one. Mini Adventure currently uses MLA - Deposit at $25. Summer Shed has a separate $100 deposit.
2. If a new deposit is needed, give it a separate Stripe product with a positive One time USD price. A tuition price and its deposit must be on different Stripe products.
3. Create or update the deposit’s Noloco Product using the same copying steps above. Put the deposit’s own prod_ ID in Stripe Product ID and its price_ ID in Stripe Single Sale Price ID / Single_sale_price. Enter its matching amount and display label.

Reusing the same deposit product is fine when the amount should be the same. Changing a shared deposit changes new checkouts for every session using it.


## 5. Assign the products to the Session

1. Open Sessions and choose the exact session, including the right day or block.
2. Open Edit Record. In Tuition_product, select the tuition Product you prepared. In Deposit_product, select the deposit Product if that session should take one.
3. Select products by name from the lists. Do not paste Stripe IDs into these two Session fields.
4. Find Offer monthly payments. Turn it on only if families should be able to choose monthly arrangements for this session. Assign the deposit product first. Leave it off for full-payment-only sessions. New sessions start with it off.
5. Check Parent_program and Parent_workshop. Leave them unchanged unless you are deliberately correcting the session’s placement.
6. Return to Details, then reopen Edit Record to confirm the selected products were kept. The Session fields update directly; there is no separate Save button on this screen.

To add a new session, create it in Webflow using your usual process and publish it. Once it appears in Noloco Sessions, assign its tuition and deposit products here. Names, dates and times come from Webflow.


Check the actual start and end dates. A new Lab must have dates covered by the qualifying Players registration. A completely new program type needs Mack’s setup before it can use this checkout; adding a name and price alone is not enough.


## 6. Know which payment choices will appear

- Pay in full uses Single_sale_price on the tuition Product.
- Pay per semester uses Semester_price on the tuition Product. It must be a One time Stripe price. Staff arrange any later semester payment.
- Monthly payments collect Single_sale_price from the Session’s Deposit_product. Staff arrange the later payments; checkout does not start a subscription.
- Offer monthly payments on the Session controls whether Monthly payments appears for regular programs and Labs. An assigned deposit alone does not turn it on. A valid deposit price is needed when the checkbox is on.
- Short Mini Adventure blocks and Summer Shed remain full-payment-only choices, even with a deposit assigned. Pending students pay the assigned deposit; Approved students pay tuition.

Keep the deposit assigned when Pending students should pay it. They still pay that deposit when Offer monthly payments is off. Without an assigned deposit, a Pending student can be quoted tuition instead. Do not remove the deposit just to hide monthly arrangements.


Deposits are charged per registration row and credited toward tuition. Financial aid reduces tuition, not deposits. Customer-entered coupons, when no aid is applied, follow their Stripe settings and may reduce deposits too.


## 7. Check it before announcing a new price

1. Allow the saved details to appear, then reload the family registration page.
2. Using a parent account, choose the exact session and an Approved student. Check the full tuition and each payment choice you intend to offer.
3. Check a Pending student as well, where available, to confirm the assigned deposit appears. Do not approve a student just to run this check.
4. If families will mix sessions, check a mixed order too. Full-payment-only items keep their tuition. A payment choice must be available for all selected items that offer plans.
5. Continue to Stripe checkout and check the price shown there. You can stop without paying. Finishing live checkout can charge the payment method.
6. Check any public price wording on the website and update it through your usual Webflow process if needed.

If you need a complete payment test, arrange it with Mack. A coupon covering a deposit does not necessarily clear the tuition balance, and a $0 checkout may not save a new card.


## If something looks wrong

- Wrong amount at checkout: check the price_ ID in Single_sale_price or Semester_price. The Stripe amount for that ID controls the charge.
- Pricing unavailable: check that the product and price are active in Stripe, the price is One time in USD, and the IDs belong together.
- A change affected more sessions than expected: check whether they share the same tuition or deposit Product.
- Monthly is missing for a regular program or Lab: open the Session’s Edit Record tab. Check Offer monthly payments and its assigned Deposit_product. Both must be set. The old Monthly_price field does not control this choice.
- No monthly choice for Mini Adventure or Summer Shed: that is the current setup. Do not fill the old Monthly_price field to try to add it.
- The Lab is blocked: check the child’s own Active Players 2, 3 or 4 registration and the dates. Changing a price does not change eligibility.

## Quick field lookup


The Add Product form uses longer labels than the existing record. Use the matching field below.


| You are copying | Add Product form | Existing product record |
| --- | --- | --- |
| Product ID: prod_… | Stripe Product ID | Stripe Product ID |
| Full tuition Price ID: price_… | Stripe Single Sale Price ID | Single_sale_price |
| Semester Price ID: price_… | Stripe Semester Price ID | Semester_price |
| Deposit Price ID: price_… (on the separate deposit Product) | Stripe Single Sale Price ID | Single_sale_price |