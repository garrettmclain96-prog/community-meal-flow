REVOKE ALL ON FUNCTION public.claim_kitchen(uuid, text, text) FROM anon;
REVOKE ALL ON FUNCTION public.claim_delivery_run(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.advance_delivery_run(uuid, text) FROM anon;
REVOKE ALL ON FUNCTION public.my_volunteer_id() FROM anon;
REVOKE ALL ON FUNCTION public.create_delivery_run_on_prepared() FROM PUBLIC, anon, authenticated;

INSERT INTO public.kitchens
  (owner_id, name, kind, kind_detail, city, neighborhood, address, postal_code, latitude, longitude,
   website, summary, daily_capacity_meals, cost_per_meal, approved, active, claimed, source)
VALUES
  (NULL, 'CHRISTUS Our Daily Bread', 'community kitchen', 'soup kitchen and day center', 'Galveston', 'Downtown',
   '2420 Winnie St', '77550', 29.30500, -94.79450, 'https://christusfoundation.org/programs/christus-our-daily-bread',
   'Hot breakfast and lunch Monday through Friday for adults experiencing homelessness, alongside showers, clothing and peer support.',
   120, 6.25, true, true, false, 'community_listing'),
  (NULL, 'Galveston Island Meals on Wheels', 'community kitchen', 'home-delivered meals', 'Galveston', 'Fish Village',
   '2803 53rd St', '77551', 29.28950, -94.81850, 'https://mealsonwheelsgalveston.org',
   'Cooks and delivers a noon meal every weekday to homebound island residents across 19 routes.',
   200, 6.75, true, true, false, 'community_listing'),
  (NULL, 'St. Vincent''s House', 'community kitchen', 'pantry and outreach', 'Galveston', 'Central City',
   '2817 Post Office St', '77550', 29.30450, -94.79350, 'https://stvhope.org',
   'Drive-through food pantry, snack packs and wraparound health and social services in the heart of the island.',
   80, 6.00, true, true, false, 'community_listing'),
  (NULL, 'Catholic Charities Beacon of Hope — Isle Market', 'community kitchen', 'client-choice pantry', 'Galveston', 'Midtown',
   '4700 Broadway St, Suite B-101', '77551', 29.29800, -94.81400, 'https://catholiccharities.org',
   'Client-choice grocery-style pantry paired with rent and utility assistance for island families.',
   90, 6.50, true, true, false, 'community_listing'),
  (NULL, 'The Salvation Army Center of Hope', 'community kitchen', 'shelter kitchen', 'Galveston', 'Fish Village',
   '601 51st St', '77551', 29.28900, -94.82100, 'https://southernusa.salvationarmy.org/galveston',
   'Emergency shelter for men, women and families, serving a hot evening meal to every guest.',
   75, 6.25, true, true, false, 'community_listing'),
  (NULL, 'JC''s Food Pantry — First Baptist Galveston', 'church kitchen', 'weekday pantry', 'Galveston', 'Downtown',
   '822 23rd St', '77550', 29.30300, -94.79600, 'https://galvestonfbc.org/food-pantry',
   'Walk-in food and clothing assistance weekdays from 9am to 2pm, run by church volunteers.',
   50, 5.75, true, true, false, 'community_listing'),
  (NULL, 'The Chosen Ones Outreach Ministries', 'church kitchen', 'emergency pantry and monthly meal', 'Galveston', 'Central City',
   '2628 Ball Ave', '77550', 29.30100, -94.79950, NULL,
   '24-hour emergency food pantry with senior boxes, veteran referrals and a community meal on the third Friday of each month.',
   40, 5.50, true, true, false, 'community_listing'),
  (NULL, 'Galveston ISD Child Nutrition', 'school kitchen', 'summer food service program', 'Galveston', 'Island-wide',
   '3904 Ave T', '77550', 29.30130, -94.79770, 'https://www.gisd.org',
   'Free summer breakfast and lunch for any child or teen aged 1 to 18 at rotating campus sites across the island.',
   250, 5.25, true, true, false, 'community_listing'),
  (NULL, 'Good Samaritan Ministry — FUMC La Marque', 'church kitchen', 'biweekly pantry', 'La Marque', 'La Marque',
   '1825 Howell Ave', '77568', 29.36850, -94.97100, NULL,
   'Every-other-Wednesday food pantry serving La Marque and Texas City residents, started after the 2023 storm response.',
   60, 5.75, true, true, false, 'community_listing'),
  (NULL, 'The Fellowship of Texas City', 'church kitchen', 'mobile distribution', 'Texas City', 'Texas City',
   '2222 Hwy 146 N', '77590', 29.40200, -94.94800, 'https://thefellowshiptc.churchcenter.com',
   'Hosts a bimonthly mobile food distribution with the Galveston County Food Bank in its parking lot.',
   100, 5.50, true, true, false, 'community_listing');