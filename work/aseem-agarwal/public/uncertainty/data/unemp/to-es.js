var fs = require('fs');
var csv = require('csv');
var deferred = require('deferred');
var data,headers, rows, ctAtOnce = 10000;

var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
  host: 'https://search-undp-nnvlmicmvsudjoqjuj574sqrty.us-west-2.es.amazonaws.com/'
});

var ccodes = [
  {
    "Country Code": "ABW",
    "Region": "Latin America & Caribbean",
    "IncomeGroup": "High income",
    "SpecialNotes": "SNA data for 2000-2011 are updated from official government statistics; 1994-1999 from UN databases. Base year has changed from 1995 to 2000.",
    "TableName": "Aruba",
    "": ""
  },
  {
    "Country Code": "AFG",
    "Region": "South Asia",
    "IncomeGroup": "Low income",
    "SpecialNotes": "Fiscal year end: March 20; reporting period for national accounts data: FY (from 2013 are CY). National accounts data are sourced from the IMF and differ from the Central Statistics Organization numbers due to exclusion of the opium economy.",
    "TableName": "Afghanistan",
    "": ""
  },
  {
    "Country Code": "AGO",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "April 2013 database update: Based on IMF data, national accounts data were revised for 2000 onward; the base year changed to 2002.",
    "TableName": "Angola",
    "": ""
  },
  {
    "Country Code": "ALB",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "",
    "TableName": "Albania",
    "": ""
  },
  {
    "Country Code": "AND",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "High income",
    "SpecialNotes": "The base year has changed to 2000. Price valuation is in basic prices.",
    "TableName": "Andorra",
    "": ""
  },
  {
    "Country Code": "ARB",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "Arab World aggregate. Arab World is composed of members of the League of Arab States.",
    "TableName": "Arab World",
    "": ""
  },
  {
    "Country Code": "ARE",
    "Region": "Middle East & North Africa",
    "IncomeGroup": "High income",
    "SpecialNotes": "April 2013 database update: Based on data from the National Bureau of Statistics, national accounts data were revised for 2001 onward; the base year changed to 2007.",
    "TableName": "United Arab Emirates",
    "": ""
  },
  {
    "Country Code": "ARG",
    "Region": "Latin America & Caribbean",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "Argentina, which was temporarily unclassified in July 2016 pending release of revised national accounts statistics, is classified as upper middle income for FY17 as of September 29, 2016 based on the following:\n\n1. The International Monetary Fund (IMF) has called on Argentina to adopt measures to address the quality of official GDP and consumer price index data, and issued an updated statement on Argentina’s progress on August 31, 2016: http://www.imf.org/en/News/Articles/2016/08/31/PR16389-Statement-by-the-IMF-Executive-Board-on-Argentina. \n\n2. The World Bank systematically assesses the appropriateness of official exchange rates as conversion factors. An alternative conversion factor is used when the official exchange rate is judged to diverge by an exceptionally large margin from the rate effectively applied to domestic transactions of foreign currencies and traded products. In the case of Argentina, the World Bank has found that during 2012-2015 there were two exchange rates (official and parallel) and parallel exchange rate (blue chip swap rate) was used in around 20% of the transactions. Based on this information an alternative conversion factor has been calculated using a weighted average method for this period.",
    "TableName": "Argentina",
    "": ""
  },
  {
    "Country Code": "ARM",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "",
    "TableName": "Armenia",
    "": ""
  },
  {
    "Country Code": "ASM",
    "Region": "East Asia & Pacific",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "",
    "TableName": "American Samoa",
    "": ""
  },
  {
    "Country Code": "ATG",
    "Region": "Latin America & Caribbean",
    "IncomeGroup": "High income",
    "SpecialNotes": "April 2012 database update: Based on official government statistics, national accounts data were revised for 2000 onward; the base year changed to 2006.",
    "TableName": "Antigua and Barbuda",
    "": ""
  },
  {
    "Country Code": "AUS",
    "Region": "East Asia & Pacific",
    "IncomeGroup": "High income",
    "SpecialNotes": "Fiscal year end: June 30; reporting period for national accounts data: FY. Value added current series updated by the Australian Bureau of Statistics; data revised from 1990 onward; Australia reports using SNA 2008.",
    "TableName": "Australia",
    "": ""
  },
  {
    "Country Code": "AUT",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "High income",
    "SpecialNotes": "A simple multiplier is used to convert the national currencies of EMU members to euros. The following irrevocable euro conversion rate was adopted by the EU Council on January 1, 1999: 1 euro = 13.7603 Austrian schilling. Please note that historical data before 1999 are not actual euros and are not comparable or suitable for aggregation across countries.",
    "TableName": "Austria",
    "": ""
  },
  {
    "Country Code": "AZE",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "April 2012 database update: National accounts historical expenditure series in constant prices were revised in line with State Statistical Committee data that were not previously available.",
    "TableName": "Azerbaijan",
    "": ""
  },
  {
    "Country Code": "BDI",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Low income",
    "SpecialNotes": "",
    "TableName": "Burundi",
    "": ""
  },
  {
    "Country Code": "BEL",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "High income",
    "SpecialNotes": "A simple multiplier is used to convert the national currencies of EMU members to euros. The following irrevocable euro conversion rate was adopted by the EU Council on January 1, 1999: 1 euro = 40.3399 Belgian franc. Please note that historical data before 1999 are not actual euros and are not comparable or suitable for aggregation across countries.",
    "TableName": "Belgium",
    "": ""
  },
  {
    "Country Code": "BEN",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Low income",
    "SpecialNotes": "Based on official government statistics, the new base year is 2007. Price valuation is in basic prices.",
    "TableName": "Benin",
    "": ""
  },
  {
    "Country Code": "BFA",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Low income",
    "SpecialNotes": "",
    "TableName": "Burkina Faso",
    "": ""
  },
  {
    "Country Code": "BGD",
    "Region": "South Asia",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "Fiscal year end: June 30; reporting period for national accounts data: FY. The new base year is 2005/06.",
    "TableName": "Bangladesh",
    "": ""
  },
  {
    "Country Code": "BGR",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "The new reference year for chain linked series is 2010. April 2011 database update: The National Statistical Office revised national accounts data from 1995 onward. GDP in current prices were about 4 percent higher than previous estimates.",
    "TableName": "Bulgaria",
    "": ""
  },
  {
    "Country Code": "BHR",
    "Region": "Middle East & North Africa",
    "IncomeGroup": "High income",
    "SpecialNotes": "Based on official government statistics; the new base year is 2010.",
    "TableName": "Bahrain",
    "": ""
  },
  {
    "Country Code": "BHS",
    "Region": "Latin America & Caribbean",
    "IncomeGroup": "High income",
    "SpecialNotes": "",
    "TableName": "Bahamas, The",
    "": ""
  },
  {
    "Country Code": "BIH",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "Based on official government statistics for chain linked series; the new reference year is 2010.",
    "TableName": "Bosnia and Herzegovina",
    "": ""
  },
  {
    "Country Code": "BLR",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "In July 2016 a new Belarusian ruble was introduced, at a rate of 1 new ruble = 10,000 old rubles. Local currency values in this database are in old rubels.",
    "TableName": "Belarus",
    "": ""
  },
  {
    "Country Code": "BLZ",
    "Region": "Latin America & Caribbean",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "",
    "TableName": "Belize",
    "": ""
  },
  {
    "Country Code": "BMU",
    "Region": "North America",
    "IncomeGroup": "High income",
    "SpecialNotes": "",
    "TableName": "Bermuda",
    "": ""
  },
  {
    "Country Code": "BOL",
    "Region": "Latin America & Caribbean",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "",
    "TableName": "Bolivia",
    "": ""
  },
  {
    "Country Code": "BRA",
    "Region": "Latin America & Caribbean",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "Based on official government statistics, the new reference year is 2000.",
    "TableName": "Brazil",
    "": ""
  },
  {
    "Country Code": "BRB",
    "Region": "Latin America & Caribbean",
    "IncomeGroup": "High income",
    "SpecialNotes": "",
    "TableName": "Barbados",
    "": ""
  },
  {
    "Country Code": "BRN",
    "Region": "East Asia & Pacific",
    "IncomeGroup": "High income",
    "SpecialNotes": "",
    "TableName": "Brunei Darussalam",
    "": ""
  },
  {
    "Country Code": "BTN",
    "Region": "South Asia",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "April 2013 database update: Data were updated using the government of Bhutan macroeconomic framework.",
    "TableName": "Bhutan",
    "": ""
  },
  {
    "Country Code": "BWA",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "Fiscal year end: March 31; reporting period for national accounts data: CY. Based on official government statistics, national accounts data have been revised from 2006 onward; the new base year is 2006. Data before 2006 were reported on a fiscal year basis.",
    "TableName": "Botswana",
    "": ""
  },
  {
    "Country Code": "CAF",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Low income",
    "SpecialNotes": "The base year has reverted back to 1985.",
    "TableName": "Central African Republic",
    "": ""
  },
  {
    "Country Code": "CAN",
    "Region": "North America",
    "IncomeGroup": "High income",
    "SpecialNotes": "Fiscal year end: March 31; reporting period for national accounts data: CY.",
    "TableName": "Canada",
    "": ""
  },
  {
    "Country Code": "CEB",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "Central Europe and the Baltics aggregate.",
    "TableName": "Central Europe and the Baltics",
    "": ""
  },
  {
    "Country Code": "CHE",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "High income",
    "SpecialNotes": "",
    "TableName": "Switzerland",
    "": ""
  },
  {
    "Country Code": "CHI",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "High income",
    "SpecialNotes": "",
    "TableName": "Channel Islands",
    "": ""
  },
  {
    "Country Code": "CHL",
    "Region": "Latin America & Caribbean",
    "IncomeGroup": "High income",
    "SpecialNotes": "",
    "TableName": "Chile",
    "": ""
  },
  {
    "Country Code": "CHN",
    "Region": "East Asia & Pacific",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "On 1 July 1997 China resumed its exercise of sovereignty over Hong Kong; and on 20 December 1999 China resumed its exercise of sovereignty over Macao. Unless otherwise noted, data for China do not include data for Hong Kong SAR, China; Macao SAR, China; or Taiwan, China. Based on data from the National Bureau of Statistics, the methodology for national accounts exports and imports of goods and services in constant prices have been revised from 2000 onward.",
    "TableName": "China",
    "": ""
  },
  {
    "Country Code": "CIV",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "The new base year is 2009.",
    "TableName": "Côte d'Ivoire",
    "": ""
  },
  {
    "Country Code": "CMR",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "",
    "TableName": "Cameroon",
    "": ""
  },
  {
    "Country Code": "COD",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Low income",
    "SpecialNotes": "Based on official government statistics; the new base year 2005.",
    "TableName": "Congo, Dem. Rep.",
    "": ""
  },
  {
    "Country Code": "COG",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "April 2013 database update: Based on IMF data, national accounts data were revised for 1990 onward; the base year changed to 1990.",
    "TableName": "Congo, Rep.",
    "": ""
  },
  {
    "Country Code": "COL",
    "Region": "Latin America & Caribbean",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "",
    "TableName": "Colombia",
    "": ""
  },
  {
    "Country Code": "COM",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Low income",
    "SpecialNotes": "",
    "TableName": "Comoros",
    "": ""
  },
  {
    "Country Code": "CPV",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "Cabo Verde is the new name for the country previously listed as Cape Verde. Based on official government statistics and IMF data, national accounts data have been revised from 1990 onward; the new base year is 2007.",
    "TableName": "Cabo Verde",
    "": ""
  },
  {
    "Country Code": "CRI",
    "Region": "Latin America & Caribbean",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "",
    "TableName": "Costa Rica",
    "": ""
  },
  {
    "Country Code": "CSS",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "Caribbean small states aggregate.",
    "TableName": "Caribbean small states",
    "": ""
  },
  {
    "Country Code": "CUB",
    "Region": "Latin America & Caribbean",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "Based on official government statistics, the new reference year is 2005.",
    "TableName": "Cuba",
    "": ""
  },
  {
    "Country Code": "CUW",
    "Region": "Latin America & Caribbean",
    "IncomeGroup": "High income",
    "SpecialNotes": "",
    "TableName": "Curaçao",
    "": ""
  },
  {
    "Country Code": "CYM",
    "Region": "Latin America & Caribbean",
    "IncomeGroup": "High income",
    "SpecialNotes": "",
    "TableName": "Cayman Islands",
    "": ""
  },
  {
    "Country Code": "CYP",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "High income",
    "SpecialNotes": "A simple multiplier is used to convert the national currencies of EMU members to euros. The following irrevocable euro conversion rate entered into force on January 1, 2008: 1 euro = 0.585274 Cyprus pounds. Please note that historical data are not actual euros and are not comparable or suitable for aggregation across countries.",
    "TableName": "Cyprus",
    "": ""
  },
  {
    "Country Code": "CZE",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "High income",
    "SpecialNotes": "",
    "TableName": "Czech Republic",
    "": ""
  },
  {
    "Country Code": "DEU",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "High income",
    "SpecialNotes": "A simple multiplier is used to convert the national currencies of EMU members to euros. The following irrevocable euro conversion rate was adopted by the EU Council on January 1, 1999: 1 euro = 1.95583 German mark. Please note that historical data before 1999 are not actual euros and are not comparable or suitable for aggregation across countries.",
    "TableName": "Germany",
    "": ""
  },
  {
    "Country Code": "DJI",
    "Region": "Middle East & North Africa",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "",
    "TableName": "Djibouti",
    "": ""
  },
  {
    "Country Code": "DMA",
    "Region": "Latin America & Caribbean",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "April 2012 database update: Based on official government statistics, national accounts data were revised for 2000 onward; the base year changed to 2006.",
    "TableName": "Dominica",
    "": ""
  },
  {
    "Country Code": "DNK",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "High income",
    "SpecialNotes": "",
    "TableName": "Denmark",
    "": ""
  },
  {
    "Country Code": "DOM",
    "Region": "Latin America & Caribbean",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "Based on data from the Central Bank of Dominican Republic, the new base year is 2007.",
    "TableName": "Dominican Republic",
    "": ""
  },
  {
    "Country Code": "DZA",
    "Region": "Middle East & North Africa",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "",
    "TableName": "Algeria",
    "": ""
  },
  {
    "Country Code": "EAP",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "East Asia and Pacific regional aggregate (does not include high-income economies).",
    "TableName": "East Asia & Pacific (excluding high income)",
    "": ""
  },
  {
    "Country Code": "EAR",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "Early-dividend countries are mostly lower-middle-income countries further along the fertility transition. Fertility rates have fallen below four births per woman and the working-age share of the population is likely rising considerably.",
    "TableName": "Early-demographic dividend",
    "": ""
  },
  {
    "Country Code": "EAS",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "East Asia and Pacific regional aggregate (includes all income levels).",
    "TableName": "East Asia & Pacific",
    "": ""
  },
  {
    "Country Code": "ECA",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "Europe and Central Asia regional aggregate (does not include high-income economies).",
    "TableName": "Europe & Central Asia (excluding high income)",
    "": ""
  },
  {
    "Country Code": "ECS",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "Europe and Central Asia regional aggregate (includes all income levels).",
    "TableName": "Europe & Central Asia",
    "": ""
  },
  {
    "Country Code": "ECU",
    "Region": "Latin America & Caribbean",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "National accounts have been revised from 1965 onward based on official government data; the new base year is 2007. The large upward changes are due to an improved calculation method for nominal GDP.",
    "TableName": "Ecuador",
    "": ""
  },
  {
    "Country Code": "EGY",
    "Region": "Middle East & North Africa",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "Fiscal year end: June 30; reporting period for national accounts data: FY. The new base year is 2011/12.",
    "TableName": "Egypt, Arab Rep.",
    "": ""
  },
  {
    "Country Code": "EMU",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "Euro area aggregate.",
    "TableName": "Euro area",
    "": ""
  },
  {
    "Country Code": "ERI",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Low income",
    "SpecialNotes": "April 2013 database update: Based on IMF data, national accounts data were revised for 2000 onward; the base year changed to 2000.",
    "TableName": "Eritrea",
    "": ""
  },
  {
    "Country Code": "ESP",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "High income",
    "SpecialNotes": "A simple multiplier is used to convert the national currencies of EMU members to euros. The following irrevocable euro conversion rate was adopted by the EU Council on January 1, 1999: 1 euro = 166.386 Spanish peseta. Please note that historical data before 1999 are not actual euros and are not comparable or suitable for aggregation across countries.",
    "TableName": "Spain",
    "": ""
  },
  {
    "Country Code": "EST",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "High income",
    "SpecialNotes": "A simple multiplier is used to convert the national currencies of EMU members to euros. The following irrevocable euro conversion rate entered into force on January 1, 2011: 1 euro = 15.6466 Estonian kroon. Please note that historical data are not actual euros and are not comparable or suitable for aggregation across countries.",
    "TableName": "Estonia",
    "": ""
  },
  {
    "Country Code": "ETH",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Low income",
    "SpecialNotes": "Fiscal year end: July 7; reporting period for national accounts data: FY. Based on IMF data, national accounts data have been revised for 2000 onward; the new base year is 2010/11.",
    "TableName": "Ethiopia",
    "": ""
  },
  {
    "Country Code": "EUU",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "European Union aggregate.",
    "TableName": "European Union",
    "": ""
  },
  {
    "Country Code": "FCS",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "Fragile and conflict affected situations aggregate. Countries with fragile situations are primarily International Development Association-eligible countries and nonmember or inactive countries and territories with a 3.2 or lower harmonized average of the World Bank's Country Policy and Institutional Assessment rating and the corresponding rating by a regional development bank, or that have had a UN or regional peacebuilding and political mission (for example by the African Union, European Union, or Organization of American States) or peacekeeping mission (for example, by the African Union, European Union, North Atlantic Treaty Organization, or Organization of American States) during the last three years. The group excludes IBRD countries (for which the CPIA scores are not publically disclosed); unless there is the presence of a peace-keeping or political/peacebuilding mission. This definition is pursuant to an agreement between the World Bank and other multilateral development banks at the start of the International Development Association 15 round in 2007. The list of countries and territories with fragile situations is imperfect and used here to reflect a complex concept. The World Bank continues to work with partners and client countries to refine the concept.",
    "TableName": "Fragile and conflict affected situations",
    "": ""
  },
  {
    "Country Code": "FIN",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "High income",
    "SpecialNotes": "A simple multiplier is used to convert the national currencies of EMU members to euros. The following irrevocable euro conversion rate was adopted by the EU Council on January 1, 1999: 1 euro = 5.94573 Finnish markka. Please note that historical data before 1999 are not actual euros and are not comparable or suitable for aggregation across countries.",
    "TableName": "Finland",
    "": ""
  },
  {
    "Country Code": "FJI",
    "Region": "East Asia & Pacific",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "Based on data from the Bureau of Statistics, national accounts data on the expenditure side have been revised from 2005 onward; the new base year is 2005.",
    "TableName": "Fiji",
    "": ""
  },
  {
    "Country Code": "FRA",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "High income",
    "SpecialNotes": "A simple multiplier is used to convert the national currencies of EMU members to euros. The following irrevocable euro conversion rate was adopted by the EU Council on January 1, 1999: 1 euro = 6.55957 French franc. Please note that historical data before 1999 are not actual euros and are not comparable or suitable for aggregation across countries.",
    "TableName": "France",
    "": ""
  },
  {
    "Country Code": "FRO",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "High income",
    "SpecialNotes": "",
    "TableName": "Faroe Islands",
    "": ""
  },
  {
    "Country Code": "FSM",
    "Region": "East Asia & Pacific",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "Fiscal year ends on September 30; reporting period for national accounts data: FY. Based on the Pacific and Virgin Islands Training Initiative, national accounts data have been revised from 2009 onward. 2013 estimates are based on the IMF Small States Monitor, Issue 1.2014. In 2010, the government statistical office revised national accounts data for 1995-2008.",
    "TableName": "Micronesia, Fed. Sts.",
    "": ""
  },
  {
    "Country Code": "GAB",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "Based on IMF data and official government statistics; the new base year is 2001.",
    "TableName": "Gabon",
    "": ""
  },
  {
    "Country Code": "GBR",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "High income",
    "SpecialNotes": "",
    "TableName": "United Kingdom",
    "": ""
  },
  {
    "Country Code": "GEO",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "Value added data in constant prices before 2007 have been temporarily removed until revised series become available. Constant price expenditure estimates before 2011 have been deleted.",
    "TableName": "Georgia",
    "": ""
  },
  {
    "Country Code": "GHA",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "In 2010, the Ghana Statistical Service revised the base year for Ghana's national accounts series from 1993 to 2006. The new GDP data were about 60 percent higher than previously reported and incorporated improved data sources and methodology.",
    "TableName": "Ghana",
    "": ""
  },
  {
    "Country Code": "GIB",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "High income",
    "SpecialNotes": "",
    "TableName": "Gibraltar",
    "": ""
  },
  {
    "Country Code": "GIN",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Low income",
    "SpecialNotes": "",
    "TableName": "Guinea",
    "": ""
  },
  {
    "Country Code": "GMB",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Low income",
    "SpecialNotes": "Fiscal year end: June 30; reporting period for national accounts data: CY. April 2013 database update: Based on official government statistics, national accounts data were revised for 2004 onward; the base year changed to 2004.",
    "TableName": "Gambia, The",
    "": ""
  },
  {
    "Country Code": "GNB",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Low income",
    "SpecialNotes": "In 2010, national accounts data for 2003-09 were revised. The new data had broader coverage of all sectors of the economy, and GDP in current prices averaged 89 percent higher than previous estimates.",
    "TableName": "Guinea-Bissau",
    "": ""
  },
  {
    "Country Code": "GNQ",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "National accounts have been revised from 1980 onward based on IMF data and official government statistics; the new base year is 2006.",
    "TableName": "Equatorial Guinea",
    "": ""
  },
  {
    "Country Code": "GRC",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "High income",
    "SpecialNotes": "A simple multiplier is used to convert the national currencies of EMU members to euros. The following irrevocable euro conversion rate was adopted by the EU Council on January 1, 1999: 1 euro = 340.75 Greek drachma. Please note that historical data before 1999 are not actual euros and are not comparable or suitable for aggregation across countries.",
    "TableName": "Greece",
    "": ""
  },
  {
    "Country Code": "GRD",
    "Region": "Latin America & Caribbean",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "April 2012 database update: Based on official government statistics, national accounts data were revised for 2000 onward; the base year changed to 2006.",
    "TableName": "Grenada",
    "": ""
  },
  {
    "Country Code": "GRL",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "High income",
    "SpecialNotes": "",
    "TableName": "Greenland",
    "": ""
  },
  {
    "Country Code": "GTM",
    "Region": "Latin America & Caribbean",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "",
    "TableName": "Guatemala",
    "": ""
  },
  {
    "Country Code": "GUM",
    "Region": "East Asia & Pacific",
    "IncomeGroup": "High income",
    "SpecialNotes": "",
    "TableName": "Guam",
    "": ""
  },
  {
    "Country Code": "GUY",
    "Region": "Latin America & Caribbean",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "In 2010, the Bureau of Statistics introduced a new series of GDP rebased to year 2006. Current price GDP averaged 63 percent higher than previous estimates.",
    "TableName": "Guyana",
    "": ""
  },
  {
    "Country Code": "HIC",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "High income group aggregate. High-income economies are those in which 2015 GNI per capita was $12,476 or more.",
    "TableName": "High income",
    "": ""
  },
  {
    "Country Code": "HKG",
    "Region": "East Asia & Pacific",
    "IncomeGroup": "High income",
    "SpecialNotes": "On 1 July 1997 China resumed its exercise of sovereignty over Hong Kong. Unless otherwise noted, data for China do not include data for Hong Kong SAR, China; Macao SAR, China; or Taiwan, China. Agriculture value added includes mining and quarrying.",
    "TableName": "Hong Kong SAR, China",
    "": ""
  },
  {
    "Country Code": "HND",
    "Region": "Latin America & Caribbean",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "",
    "TableName": "Honduras",
    "": ""
  },
  {
    "Country Code": "HPC",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "Heavily indebted poor countries aggregate.",
    "TableName": "Heavily indebted poor countries (HIPC)",
    "": ""
  },
  {
    "Country Code": "HRV",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "High income",
    "SpecialNotes": "The new reference year for chain linked series is 2010. April 2013 database update: Based on official government statistics, the base year for constant price series changed to 2005.",
    "TableName": "Croatia",
    "": ""
  },
  {
    "Country Code": "HTI",
    "Region": "Latin America & Caribbean",
    "IncomeGroup": "Low income",
    "SpecialNotes": "Fiscal year end: September 30; reporting period for national accounts data: FY. In 2010, the government revised national accounts data following changes in the methodology. Current price series since 1991 and constant price series since 1996 were revised.",
    "TableName": "Haiti",
    "": ""
  },
  {
    "Country Code": "HUN",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "High income",
    "SpecialNotes": "April 2012 database update: Based on data from the Organisation for Economic Co-operation and Development, national accounts data were revised for 1991 onward.",
    "TableName": "Hungary",
    "": ""
  },
  {
    "Country Code": "IBD",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "IBRD only group aggregate.",
    "TableName": "IBRD only",
    "": ""
  },
  {
    "Country Code": "IBT",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "IDA and IBRD total group aggregate (includes IDA only, IDA blend, and IBRD only).",
    "TableName": "IDA & IBRD total",
    "": ""
  },
  {
    "Country Code": "IDA",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "IDA total group aggregate (includes IDA only and IDA blend).",
    "TableName": "IDA total",
    "": ""
  },
  {
    "Country Code": "IDB",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "IDA blend group aggregate.",
    "TableName": "IDA blend",
    "": ""
  },
  {
    "Country Code": "IDN",
    "Region": "East Asia & Pacific",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "Fiscal year end: March 31; reporting period for national accounts data: CY. Data for Indonesia include Timor-Leste through 1999 unless otherwise noted. Statistics Indonesia revised national accounts based on SNA2008. The new base year is 2010. Price valuation is in basic prices.",
    "TableName": "Indonesia",
    "": ""
  },
  {
    "Country Code": "IDX",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "IDA only group aggregate.",
    "TableName": "IDA only",
    "": ""
  },
  {
    "Country Code": "IMN",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "High income",
    "SpecialNotes": "The new base year is 2013.",
    "TableName": "Isle of Man",
    "": ""
  },
  {
    "Country Code": "IND",
    "Region": "South Asia",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "Fiscal year end: March 31; reporting period for national accounts data: FY. Based on official government statistics; the new base year is 2011/12. India reports using SNA 2008.",
    "TableName": "India",
    "": ""
  },
  {
    "Country Code": "IRL",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "High income",
    "SpecialNotes": "A simple multiplier is used to convert the national currencies of EMU members to euros. The following irrevocable euro conversion rate was adopted by the EU Council on January 1, 1999: 1 euro = 0.787564 Irish pound. Please note that historical data before 1999 are not actual euros and are not comparable or suitable for aggregation across countries.",
    "TableName": "Ireland",
    "": ""
  },
  {
    "Country Code": "IRN",
    "Region": "Middle East & North Africa",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "Fiscal year end: March 20; reporting period for national accounts data: FY. Based on data from the Central Bank of Iran, the new base year is 2004/05.",
    "TableName": "Iran, Islamic Rep.",
    "": ""
  },
  {
    "Country Code": "IRQ",
    "Region": "Middle East & North Africa",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "Based on official government statistics, the new base year is 2007.",
    "TableName": "Iraq",
    "": ""
  },
  {
    "Country Code": "ISL",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "High income",
    "SpecialNotes": "",
    "TableName": "Iceland",
    "": ""
  },
  {
    "Country Code": "ISR",
    "Region": "Middle East & North Africa",
    "IncomeGroup": "High income",
    "SpecialNotes": "Based on official government statistics for chain linked series; the new reference year is 2010.",
    "TableName": "Israel",
    "": ""
  },
  {
    "Country Code": "ITA",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "High income",
    "SpecialNotes": "A simple multiplier is used to convert the national currencies of EMU members to euros. The following irrevocable euro conversion rate was adopted by the EU Council on January 1, 1999: 1 euro = 1936.27 Italian lira. Please note that historical data before 1999 are not actual euros and are not comparable or suitable for aggregation across countries.",
    "TableName": "Italy",
    "": ""
  },
  {
    "Country Code": "JAM",
    "Region": "Latin America & Caribbean",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "April 2013 database update: Based on official government statistics, national accounts data were revised for 2002 onward; the base year changed to 2007.",
    "TableName": "Jamaica",
    "": ""
  },
  {
    "Country Code": "JOR",
    "Region": "Middle East & North Africa",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "",
    "TableName": "Jordan",
    "": ""
  },
  {
    "Country Code": "JPN",
    "Region": "East Asia & Pacific",
    "IncomeGroup": "High income",
    "SpecialNotes": "Fiscal year end: March 31; reporting period for national accounts data: CY.",
    "TableName": "Japan",
    "": ""
  },
  {
    "Country Code": "KAZ",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "The new reference year for chain linked series is 2005.",
    "TableName": "Kazakhstan",
    "": ""
  },
  {
    "Country Code": "KEN",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "Fiscal year end: June 30; reporting period for national accounts data: CY. Based on official government statistics; the new base year is 2009.",
    "TableName": "Kenya",
    "": ""
  },
  {
    "Country Code": "KGZ",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "",
    "TableName": "Kyrgyz Republic",
    "": ""
  },
  {
    "Country Code": "KHM",
    "Region": "East Asia & Pacific",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "",
    "TableName": "Cambodia",
    "": ""
  },
  {
    "Country Code": "KIR",
    "Region": "East Asia & Pacific",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "Based on IMF and World Bank data, GDP in current and constant prices have been revised from 2000 onward. Value added components are calculated using shares from the Asian Development Bank.",
    "TableName": "Kiribati",
    "": ""
  },
  {
    "Country Code": "KNA",
    "Region": "Latin America & Caribbean",
    "IncomeGroup": "High income",
    "SpecialNotes": "April 2012 database update: Based on official government statistics, national accounts data were revised for 2000 onward; the base year changed to 2006.",
    "TableName": "St. Kitts and Nevis",
    "": ""
  },
  {
    "Country Code": "KOR",
    "Region": "East Asia & Pacific",
    "IncomeGroup": "High income",
    "SpecialNotes": "The new base year is 2010. GDP data are available from 1970 onward while components are revised from 2000 onward only. Historical data in constant prices are linked to preserve growth rates.",
    "TableName": "Korea, Rep.",
    "": ""
  },
  {
    "Country Code": "KSV",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "Kosovo became a World Bank member on June 29, 2009. Since 1999, Kosovo has been a territory under international administration pursuant to UN Security Council Resolution 1244 (1999).",
    "TableName": "Kosovo",
    "": ""
  },
  {
    "Country Code": "KWT",
    "Region": "Middle East & North Africa",
    "IncomeGroup": "High income",
    "SpecialNotes": "Fiscal year end: June 30; reporting period for national accounts data: CY. Based on official government statistics; the new base year is 2010.",
    "TableName": "Kuwait",
    "": ""
  },
  {
    "Country Code": "LAC",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "Latin America and Caribbean regional aggregate (does not include high-income economies).",
    "TableName": "Latin America & Caribbean (excluding high income)",
    "": ""
  },
  {
    "Country Code": "LAO",
    "Region": "East Asia & Pacific",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "",
    "TableName": "Lao PDR",
    "": ""
  },
  {
    "Country Code": "LBN",
    "Region": "Middle East & North Africa",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "",
    "TableName": "Lebanon",
    "": ""
  },
  {
    "Country Code": "LBR",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Low income",
    "SpecialNotes": "National accounts local currency data have been revised to be reported in U.S. dollars instead of Liberian dollars.",
    "TableName": "Liberia",
    "": ""
  },
  {
    "Country Code": "LBY",
    "Region": "Middle East & North Africa",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "Official statistics for Libya are not available; national accounts data are based on World Bank estimates. The new base year is 2003.",
    "TableName": "Libya",
    "": ""
  },
  {
    "Country Code": "LCA",
    "Region": "Latin America & Caribbean",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "April 2012 database update: Based on official government statistics, national accounts data were revised for 2000 onward; the base year changed to 2006.",
    "TableName": "St. Lucia",
    "": ""
  },
  {
    "Country Code": "LCN",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "Latin America and Caribbean regional aggregate (includes all income levels).",
    "TableName": "Latin America & Caribbean",
    "": ""
  },
  {
    "Country Code": "LDC",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "Least developed countries (UN classification) aggregate.",
    "TableName": "Least developed countries: UN classification",
    "": ""
  },
  {
    "Country Code": "LIC",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "Low income group aggregate. Low-income economies are those in which 2015 GNI per capita was $1,025 or less.",
    "TableName": "Low income",
    "": ""
  },
  {
    "Country Code": "LIE",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "High income",
    "SpecialNotes": "",
    "TableName": "Liechtenstein",
    "": ""
  },
  {
    "Country Code": "LKA",
    "Region": "South Asia",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "The Sri Lankan government has changed methodology and revised the production side of national accounts from 2010 to 2014. The new base year is 2010.",
    "TableName": "Sri Lanka",
    "": ""
  },
  {
    "Country Code": "LMC",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "Lower middle income group aggregate. Lower-middle-income economies are those in which 2015 GNI per capita was between $1,026 and $4,035.",
    "TableName": "Lower middle income",
    "": ""
  },
  {
    "Country Code": "LMY",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "Low and middle income group aggregate (all developing economies). Low- and middle-income economies are those in which 2015 GNI per capita was $12,475 or less.",
    "TableName": "Low & middle income",
    "": ""
  },
  {
    "Country Code": "LSO",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "Fiscal year end: March 31; reporting period for national accounts data: CY.",
    "TableName": "Lesotho",
    "": ""
  },
  {
    "Country Code": "LTE",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "Late-dividend countries are mostly upper-middle-income countries where fertility rates are typically above replacement levels of 2.1 births per woman, but fertility continues to decline.",
    "TableName": "Late-demographic dividend",
    "": ""
  },
  {
    "Country Code": "LTU",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "High income",
    "SpecialNotes": "A simple multiplier is used to convert the national currencies of EMU members to euros. The following irrevocable euro conversion rate entered into force on January 1, 2015: 1 euro = 3.45280 Lithuanian litas. Please note that historical data are not actual euros and are not comparable or suitable for aggregation across countries. Based on data from EUROSTAT, the new reference year is 2010.",
    "TableName": "Lithuania",
    "": ""
  },
  {
    "Country Code": "LUX",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "High income",
    "SpecialNotes": "A simple multiplier is used to convert the national currencies of EMU members to euros. The following irrevocable euro conversion rate was adopted by the EU Council on January 1, 1999: 1 euro = 40.3399 Luxembourg franc. Please note that historical data before 1999 are not actual euros and are not comparable or suitable for aggregation across countries.",
    "TableName": "Luxembourg",
    "": ""
  },
  {
    "Country Code": "LVA",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "High income",
    "SpecialNotes": "A simple multiplier is used to convert the national currencies of EMU members to euros. The following irrevocable euro conversion rate entered into force on January 1, 2014: 1 euro = 0.702804 Latvian lats. Please note that historical data are not actual euros and are not comparable or suitable for aggregation across countries. Based on data from EUROSTAT, the new reference year is 2010.",
    "TableName": "Latvia",
    "": ""
  },
  {
    "Country Code": "MAC",
    "Region": "East Asia & Pacific",
    "IncomeGroup": "High income",
    "SpecialNotes": "On 20 December 1999 China resumed its exercise of sovereignty over Macao. Unless otherwise noted, data for China do not include data for Hong Kong SAR, China; Macao SAR, China; or Taiwan, China.",
    "TableName": "Macao SAR, China",
    "": ""
  },
  {
    "Country Code": "MAF",
    "Region": "Latin America & Caribbean",
    "IncomeGroup": "High income",
    "SpecialNotes": "",
    "TableName": "St. Martin (French part)",
    "": ""
  },
  {
    "Country Code": "MAR",
    "Region": "Middle East & North Africa",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "Based on data from the Moroccan Haut Commissariat au Plan, the new base year is 2007.",
    "TableName": "Morocco",
    "": ""
  },
  {
    "Country Code": "MCO",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "High income",
    "SpecialNotes": "",
    "TableName": "Monaco",
    "": ""
  },
  {
    "Country Code": "MDA",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "",
    "TableName": "Moldova",
    "": ""
  },
  {
    "Country Code": "MDG",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Low income",
    "SpecialNotes": "",
    "TableName": "Madagascar",
    "": ""
  },
  {
    "Country Code": "MDV",
    "Region": "South Asia",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "April 2012 database update: The Department of National Planning revised national accounts data for 2000 onward; the base year changed to 2003.",
    "TableName": "Maldives",
    "": ""
  },
  {
    "Country Code": "MEA",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "Middle East and North Africa regional aggregate (includes all income levels).",
    "TableName": "Middle East & North Africa",
    "": ""
  },
  {
    "Country Code": "MEX",
    "Region": "Latin America & Caribbean",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "The new base year is 2008.",
    "TableName": "Mexico",
    "": ""
  },
  {
    "Country Code": "MHL",
    "Region": "East Asia & Pacific",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "Fiscal year ends on September 30; reporting period for national accounts data: FY.",
    "TableName": "Marshall Islands",
    "": ""
  },
  {
    "Country Code": "MIC",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "Middle income group aggregate. Middle-income economies are those in which 2015 GNI per capita was between $1,026 and $12,475.",
    "TableName": "Middle income",
    "": ""
  },
  {
    "Country Code": "MKD",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "Based on revisions by the Macedonia State Statistics Office, the new base year is 2005.",
    "TableName": "Macedonia, FYR",
    "": ""
  },
  {
    "Country Code": "MLI",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Low income",
    "SpecialNotes": "The new base year is 1999.",
    "TableName": "Mali",
    "": ""
  },
  {
    "Country Code": "MLT",
    "Region": "Middle East & North Africa",
    "IncomeGroup": "High income",
    "SpecialNotes": "A simple multiplier is used to convert the national currencies of EMU members to euros. The following irrevocable euro conversion rate entered into force on January 1, 2008: 1 euro = 0.4293 Maltese lira. Please note that historical data are not actual euros and are not comparable or suitable for aggregation across countries.",
    "TableName": "Malta",
    "": ""
  },
  {
    "Country Code": "MMR",
    "Region": "East Asia & Pacific",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "Fiscal year end: March 31; reporting period for national accounts data: FY.",
    "TableName": "Myanmar",
    "": ""
  },
  {
    "Country Code": "MNA",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "Middle East and North Africa regional aggregate (does not include high-income economies).",
    "TableName": "Middle East & North Africa (excluding high income)",
    "": ""
  },
  {
    "Country Code": "MNE",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "Montenegro declared independence from Serbia and Montenegro on June 3, 2006. Where available, data for each country are shown separately. However, for Serbia, some indicators continue to include data for Montenegro through 2005.",
    "TableName": "Montenegro",
    "": ""
  },
  {
    "Country Code": "MNG",
    "Region": "East Asia & Pacific",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "Based on data revised by the National Statistics Office of Mongolia, the new base year is 2010.",
    "TableName": "Mongolia",
    "": ""
  },
  {
    "Country Code": "MNP",
    "Region": "East Asia & Pacific",
    "IncomeGroup": "High income",
    "SpecialNotes": "",
    "TableName": "Northern Mariana Islands",
    "": ""
  },
  {
    "Country Code": "MOZ",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Low income",
    "SpecialNotes": "Based on official government statistics; the new base year is 2009.",
    "TableName": "Mozambique",
    "": ""
  },
  {
    "Country Code": "MRT",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "Based on official statistics from the Ministry of Economic Affairs and Development; the base year has been returned to 2004.",
    "TableName": "Mauritania",
    "": ""
  },
  {
    "Country Code": "MUS",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "",
    "TableName": "Mauritius",
    "": ""
  },
  {
    "Country Code": "MWI",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Low income",
    "SpecialNotes": "Fiscal year end: March 31; reporting period for national accounts data: CY. The new base year is 2010.",
    "TableName": "Malawi",
    "": ""
  },
  {
    "Country Code": "MYS",
    "Region": "East Asia & Pacific",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "Based on data from the Malaysian Department of Statistics and Bank Negara Malaysia, the new base year is 2010.",
    "TableName": "Malaysia",
    "": ""
  },
  {
    "Country Code": "NAC",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "North America regional aggregate. There are no economies in North America classified as low or middle income.",
    "TableName": "North America",
    "": ""
  },
  {
    "Country Code": "NAM",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "Fiscal year end: March 31; reporting period for national accounts data: CY. Based on official government statistics, national accounts data have been revised from 1980 onward; the new base year is 2010.",
    "TableName": "Namibia",
    "": ""
  },
  {
    "Country Code": "NCL",
    "Region": "East Asia & Pacific",
    "IncomeGroup": "High income",
    "SpecialNotes": "",
    "TableName": "New Caledonia",
    "": ""
  },
  {
    "Country Code": "NER",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Low income",
    "SpecialNotes": "Based on official government statistics, national accounts data have been revised from 2006 onward; the new base year is 2006.",
    "TableName": "Niger",
    "": ""
  },
  {
    "Country Code": "NGA",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "Based on official government statistics released 6 April, 2014, national accounts data have been revised from 2010 onward; the new base year is 2010. The new GDP data are 60 to 75 percent higher than previously reported and incorporate improved data sources and methodology. Nigeria reports using SNA 2008.",
    "TableName": "Nigeria",
    "": ""
  },
  {
    "Country Code": "NIC",
    "Region": "Latin America & Caribbean",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "April 2013 database update: Based on official government statistics, national accounts data were revised for 1994 onward; the base year changed to 2006.",
    "TableName": "Nicaragua",
    "": ""
  },
  {
    "Country Code": "NLD",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "High income",
    "SpecialNotes": "A simple multiplier is used to convert the national currencies of EMU members to euros. The following irrevocable euro conversion rate was adopted by the EU Council on January 1, 1999: 1 euro = 2.20371 Netherlands guilder. Please note that historical data before 1999 are not actual euros and are not comparable or suitable for aggregation across countries.",
    "TableName": "Netherlands",
    "": ""
  },
  {
    "Country Code": "NOR",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "High income",
    "SpecialNotes": "",
    "TableName": "Norway",
    "": ""
  },
  {
    "Country Code": "NPL",
    "Region": "South Asia",
    "IncomeGroup": "Low income",
    "SpecialNotes": "Fiscal year end: July 14; reporting period for national accounts data: FY.",
    "TableName": "Nepal",
    "": ""
  },
  {
    "Country Code": "NRU",
    "Region": "East Asia & Pacific",
    "IncomeGroup": "High income",
    "SpecialNotes": "",
    "TableName": "Nauru",
    "": ""
  },
  {
    "Country Code": "NZL",
    "Region": "East Asia & Pacific",
    "IncomeGroup": "High income",
    "SpecialNotes": "Fiscal year end: March 31; reporting period for national accounts data: CY.",
    "TableName": "New Zealand",
    "": ""
  },
  {
    "Country Code": "OED",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "OECD members aggregate.",
    "TableName": "OECD members",
    "": ""
  },
  {
    "Country Code": "OMN",
    "Region": "Middle East & North Africa",
    "IncomeGroup": "High income",
    "SpecialNotes": "Based on official government statistics; the new base year is 2010.",
    "TableName": "Oman",
    "": ""
  },
  {
    "Country Code": "OSS",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "Other small states aggregate.",
    "TableName": "Other small states",
    "": ""
  },
  {
    "Country Code": "PAK",
    "Region": "South Asia",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "Fiscal year end: June 30; reporting period for national accounts data: FY. The new base year is 2005/06.",
    "TableName": "Pakistan",
    "": ""
  },
  {
    "Country Code": "PAN",
    "Region": "Latin America & Caribbean",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "The new base year is 2007.",
    "TableName": "Panama",
    "": ""
  },
  {
    "Country Code": "PER",
    "Region": "Latin America & Caribbean",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "The new base year is 2007.",
    "TableName": "Peru",
    "": ""
  },
  {
    "Country Code": "PHL",
    "Region": "East Asia & Pacific",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "Source for GNI and net income from abroad is changed to national statistical office from central bank. April 2012 database update: National accounts data were revised for 1998 onward. Because intellectual property products are now reported as a part of gross fixed capital formation, gross domestic product (GDP) in current prices averaged 4 percent higher than previous estimates.",
    "TableName": "Philippines",
    "": ""
  },
  {
    "Country Code": "PLW",
    "Region": "East Asia & Pacific",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "Fiscal year ends on September 30; reporting period for national accounts data: FY. National accounts data are revised based on IMF reports.",
    "TableName": "Palau",
    "": ""
  },
  {
    "Country Code": "PNG",
    "Region": "East Asia & Pacific",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "",
    "TableName": "Papua New Guinea",
    "": ""
  },
  {
    "Country Code": "POL",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "High income",
    "SpecialNotes": "",
    "TableName": "Poland",
    "": ""
  },
  {
    "Country Code": "PRE",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "Pre-dividend countries are mostly low-income countries, lagging in key human development indicators and with current fertility levels above four births per woman. They face very rapid population growth.",
    "TableName": "Pre-demographic dividend",
    "": ""
  },
  {
    "Country Code": "PRI",
    "Region": "Latin America & Caribbean",
    "IncomeGroup": "High income",
    "SpecialNotes": "Fiscal year end: June 30; reporting period for national accounts data: FY. April 2012 database update: Based on data from the Instituto de Estadísticas de Puerto Rico, national accounts data were revised for 2001 onward.",
    "TableName": "Puerto Rico",
    "": ""
  },
  {
    "Country Code": "PRK",
    "Region": "East Asia & Pacific",
    "IncomeGroup": "Low income",
    "SpecialNotes": "",
    "TableName": "Korea, Dem. People's Rep.",
    "": ""
  },
  {
    "Country Code": "PRT",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "High income",
    "SpecialNotes": "A simple multiplier is used to convert the national currencies of EMU members to euros. The following irrevocable euro conversion rate was adopted by the EU Council on January 1, 1999: 1 euro = 200.482 Portuguese escudo. Please note that historical data before 1999 are not actual euros and are not comparable or suitable for aggregation across countries.",
    "TableName": "Portugal",
    "": ""
  },
  {
    "Country Code": "PRY",
    "Region": "Latin America & Caribbean",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "National accounts data have been revised from 1960 onward. The methodology and base year have not changed but the output of two hydroelectric plants (shared with neighboring countries) has been added raising GDP from previous estimates. On the supply side, it was added in \"gas, electricity and water.\" On the demand side changes were mainly to exports, but also for imports, investment and consumption. National accounts price valuations for 1991 to 2012 have also been corrected and changed from VAP to VAB.",
    "TableName": "Paraguay",
    "": ""
  },
  {
    "Country Code": "PSE",
    "Region": "Middle East & North Africa",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "The new base year is 2004.",
    "TableName": "West Bank and Gaza",
    "": ""
  },
  {
    "Country Code": "PSS",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "Pacific island small states aggregate.",
    "TableName": "Pacific island small states",
    "": ""
  },
  {
    "Country Code": "PST",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "Post-dividend countries are mostly high-income countries where fertility has transitioned below replacement levels.",
    "TableName": "Post-demographic dividend",
    "": ""
  },
  {
    "Country Code": "PYF",
    "Region": "East Asia & Pacific",
    "IncomeGroup": "High income",
    "SpecialNotes": "",
    "TableName": "French Polynesia",
    "": ""
  },
  {
    "Country Code": "QAT",
    "Region": "Middle East & North Africa",
    "IncomeGroup": "High income",
    "SpecialNotes": "Based on data from the Qatar Ministry of Development Planning and Statistics and the Qatar Central Bank, the new base year is 2013.",
    "TableName": "Qatar",
    "": ""
  },
  {
    "Country Code": "ROU",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "Based on data from EUROSTAT, the Romanian National Institute of Statistics, the National Bank of Romania, and World Bank estimates, the new base year is 2005.",
    "TableName": "Romania",
    "": ""
  },
  {
    "Country Code": "RUS",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "The new base year is 2011.",
    "TableName": "Russian Federation",
    "": ""
  },
  {
    "Country Code": "RWA",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Low income",
    "SpecialNotes": "Based on official government statistics, national accounts data are revised for 2006 onward; the new base year is 2011. Rwanda reports using SNA 2008.",
    "TableName": "Rwanda",
    "": ""
  },
  {
    "Country Code": "SAS",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "South Asia regional aggregate. There are no economies in South Asia classified as high income.",
    "TableName": "South Asia",
    "": ""
  },
  {
    "Country Code": "SAU",
    "Region": "Middle East & North Africa",
    "IncomeGroup": "High income",
    "SpecialNotes": "Based on data from the Saudi Central Department of Statistics and Information under the authority of the Ministry of Economy and Planning, the new base year is 2010.",
    "TableName": "Saudi Arabia",
    "": ""
  },
  {
    "Country Code": "SDN",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "Demographic data (total population, life expectancy, fertility, child mortality, migration), education series, and HIV prevalence are reported separately for Sudan and South Sudan; see specific notes for other series. National accounts data exclude South Sudan after July 9, 2011. Other data reported for Sudan generally include South Sudan to 2011 unless otherwise noted. External debt data and land-related data (including population density, but excluding surface area after 2010) for all years include South Sudan.",
    "TableName": "Sudan",
    "": ""
  },
  {
    "Country Code": "SEN",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Low income",
    "SpecialNotes": "",
    "TableName": "Senegal",
    "": ""
  },
  {
    "Country Code": "SGP",
    "Region": "East Asia & Pacific",
    "IncomeGroup": "High income",
    "SpecialNotes": "Fiscal year end: March 31; reporting period for national accounts data: CY. Country reports using a blend of SNA 1993 and SNA 2008. April 2012 database update: National accounts time series were replaced with official government statistics.",
    "TableName": "Singapore",
    "": ""
  },
  {
    "Country Code": "SLB",
    "Region": "East Asia & Pacific",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "National accounts data have been revised from 2007 to 2013 based on IMF reports.",
    "TableName": "Solomon Islands",
    "": ""
  },
  {
    "Country Code": "SLE",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Low income",
    "SpecialNotes": "Fiscal year end: June 30; reporting period for national accounts data: CY. April 2013 database update: Based on official government statistics, national accounts data were revised for 1990 onward; the base year changed to 2006.",
    "TableName": "Sierra Leone",
    "": ""
  },
  {
    "Country Code": "SLV",
    "Region": "Latin America & Caribbean",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "",
    "TableName": "El Salvador",
    "": ""
  },
  {
    "Country Code": "SMR",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "High income",
    "SpecialNotes": "",
    "TableName": "San Marino",
    "": ""
  },
  {
    "Country Code": "SOM",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Low income",
    "SpecialNotes": "",
    "TableName": "Somalia",
    "": ""
  },
  {
    "Country Code": "SRB",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "Montenegro declared independence from Serbia and Montenegro on June 3, 2006. Where available, data for each country are shown separately. However, for Serbia, some indicators, such as those series for which data appear only for Serbia and not Montenegro--e.g., aid, environment, external debt, balance of payments, various social indicators excluding population--continue to include data for Montenegro through 2005. Moreover, data from 1999 onward for Serbia for most indicators exclude data for Kosovo, 1999 being the year when Kosovo became a territory under international administration pursuant to UN Security Council Resolution 1244 (1999); any exceptions are noted. Kosovo became a World Bank member on June 29, 2009; available data are shown separately for Kosovo. In 2011, the Statistical Office of Serbia improved the methodology of national accounts data for 2003 onward. Specifically, the classification of sectors was revised. The new reference year for chain linked series is 2010.",
    "TableName": "Serbia",
    "": ""
  },
  {
    "Country Code": "SSA",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "Sub-Saharan Africa regional aggregate (does not include high-income economies).",
    "TableName": "Sub-Saharan Africa (excluding high income)",
    "": ""
  },
  {
    "Country Code": "SSD",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Low income",
    "SpecialNotes": "South Sudan declared its independence on July 9, 2011. Data are shown separately for South Sudan where available.",
    "TableName": "South Sudan",
    "": ""
  },
  {
    "Country Code": "SSF",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "Sub-Saharan Africa regional aggregate (includes all income levels).",
    "TableName": "Sub-Saharan Africa",
    "": ""
  },
  {
    "Country Code": "SST",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "Small states aggregate. Includes 41 members of the Small States Forum. (Does not include the high-income countries Bahrain, Brunei Darussalam, Cyprus, Estonia, Iceland, Malta, Qatar, and San Marino.)",
    "TableName": "Small states",
    "": ""
  },
  {
    "Country Code": "STP",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "The base year has changed to 2001.",
    "TableName": "São Tomé and Principe",
    "": ""
  },
  {
    "Country Code": "SUR",
    "Region": "Latin America & Caribbean",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "",
    "TableName": "Suriname",
    "": ""
  },
  {
    "Country Code": "SVK",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "High income",
    "SpecialNotes": "A simple multiplier is used to convert the national currencies of EMU members to euros. The following irrevocable euro conversion rate entered into force on January 1, 2009: 1 euro = 30.126 Slovak koruna. Please note that historical data are not actual euros and are not comparable or suitable for aggregation across countries.",
    "TableName": "Slovak Republic",
    "": ""
  },
  {
    "Country Code": "SVN",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "High income",
    "SpecialNotes": "A simple multiplier is used to convert the national currencies of EMU members to euros. The following irrevocable euro conversion rate entered into force on January 1, 2007: 1 euro = 239.64 Slovenian tolar. Please note that historical data are not actual euros and are not comparable or suitable for aggregation across countries.",
    "TableName": "Slovenia",
    "": ""
  },
  {
    "Country Code": "SWE",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "High income",
    "SpecialNotes": "Fiscal year end: June 30; reporting period for national accounts data: CY.",
    "TableName": "Sweden",
    "": ""
  },
  {
    "Country Code": "SWZ",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "Fiscal year end: March 31; reporting period for national accounts data: CY. Based on data from the Central Statistics Office of Swaziland and the IMF, the new base year is 2011.",
    "TableName": "Swaziland",
    "": ""
  },
  {
    "Country Code": "SXM",
    "Region": "Latin America & Caribbean",
    "IncomeGroup": "High income",
    "SpecialNotes": "",
    "TableName": "Sint Maarten (Dutch part)",
    "": ""
  },
  {
    "Country Code": "SYC",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "High income",
    "SpecialNotes": "April 2013 database update: Based on official government statistics, national accounts data were revised for 1976 onward; the base year changed to 2006.",
    "TableName": "Seychelles",
    "": ""
  },
  {
    "Country Code": "SYR",
    "Region": "Middle East & North Africa",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "April 2013 database update: Based on data from the Central Bureau of Statistics, national accounts data were revised for 2003 onward.",
    "TableName": "Syrian Arab Republic",
    "": ""
  },
  {
    "Country Code": "TCA",
    "Region": "Latin America & Caribbean",
    "IncomeGroup": "High income",
    "SpecialNotes": "",
    "TableName": "Turks and Caicos Islands",
    "": ""
  },
  {
    "Country Code": "TCD",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Low income",
    "SpecialNotes": "Based on IMF data, national accounts data have been revised for 2005 onward; the new base year is 2005.",
    "TableName": "Chad",
    "": ""
  },
  {
    "Country Code": "TEA",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "East Asia & Pacific (IDA & IBRD countries) aggregate.",
    "TableName": "East Asia & Pacific (IDA & IBRD)",
    "": ""
  },
  {
    "Country Code": "TEC",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "Europe & Central Asia (IDA & IBRD countries) aggregate.",
    "TableName": "Europe & Central Asia (IDA & IBRD)",
    "": ""
  },
  {
    "Country Code": "TGO",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Low income",
    "SpecialNotes": "April 2013 database update: Based on IMF data, national accounts data have been revised for 2000; the new base year is 2000.",
    "TableName": "Togo",
    "": ""
  },
  {
    "Country Code": "THA",
    "Region": "East Asia & Pacific",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "Fiscal year end: September 30; reporting period for national accounts data: CY. Based on data from the Bank of Thailand and the National Economics and Social Development Board (NESDB), the new base year is 2002.",
    "TableName": "Thailand",
    "": ""
  },
  {
    "Country Code": "TJK",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "",
    "TableName": "Tajikistan",
    "": ""
  },
  {
    "Country Code": "TKM",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "On January 1, 2009, the Turkmen manat was redenominated (1 new manat = 5,000 old manats).",
    "TableName": "Turkmenistan",
    "": ""
  },
  {
    "Country Code": "TLA",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "Latin America & the Caribbean (IDA & IBRD countries) aggregate.",
    "TableName": "Latin America & Caribbean (IDA & IBRD)",
    "": ""
  },
  {
    "Country Code": "TLS",
    "Region": "East Asia & Pacific",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "Based on official government statistics, national account data have been revised, and value added is measured at basic prices; the new base year is 2010.",
    "TableName": "Timor-Leste",
    "": ""
  },
  {
    "Country Code": "TMN",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "Middle East & North Africa (IDA & IBRD countries) aggregate.",
    "TableName": "Middle East & North Africa (IDA & IBRD)",
    "": ""
  },
  {
    "Country Code": "TON",
    "Region": "East Asia & Pacific",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "2013 national accounts estimates are based on IMF reports. Fiscal year ends on June 30; reporting period for national accounts data: FY. April 2013 database update: Based on data from the National Bureau of Statistics, national accounts data were revised; the base year changed to 2010/11.",
    "TableName": "Tonga",
    "": ""
  },
  {
    "Country Code": "TSA",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "South Asia (IDA & IBRD countries) aggregate.",
    "TableName": "South Asia (IDA & IBRD)",
    "": ""
  },
  {
    "Country Code": "TSS",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "Sub-Saharan Africa (IDA & IBRD countries) aggregate.",
    "TableName": "Sub-Saharan Africa (IDA & IBRD)",
    "": ""
  },
  {
    "Country Code": "TTO",
    "Region": "Latin America & Caribbean",
    "IncomeGroup": "High income",
    "SpecialNotes": "",
    "TableName": "Trinidad and Tobago",
    "": ""
  },
  {
    "Country Code": "TUN",
    "Region": "Middle East & North Africa",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "Based on data from Tunisia’s Ministry of Development and International Cooperation, Central Bank, and National Institute of Statistics, the new reference year is 2010.",
    "TableName": "Tunisia",
    "": ""
  },
  {
    "Country Code": "TUR",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "",
    "TableName": "Turkey",
    "": ""
  },
  {
    "Country Code": "TUV",
    "Region": "East Asia & Pacific",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "2013 national accounts estimates are based on IMF reports. Value added is measured at producer prices up to 1999 and at basic prices from 2000 onward.",
    "TableName": "Tuvalu",
    "": ""
  },
  {
    "Country Code": "TZA",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Low income",
    "SpecialNotes": "The new base year is 2007. Tanzania reports using a blend of SNA 1993 and SNA 2008.",
    "TableName": "Tanzania",
    "": ""
  },
  {
    "Country Code": "UGA",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Low income",
    "SpecialNotes": "Fiscal year end: June 30; reporting period for national accounts data: FY. Based on official government statistics; the new base year is 2009/10. Uganda reports using SNA 2008. Price valuation is in producer prices.",
    "TableName": "Uganda",
    "": ""
  },
  {
    "Country Code": "UKR",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "",
    "TableName": "Ukraine",
    "": ""
  },
  {
    "Country Code": "UMC",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "Upper middle income group aggregate. Upper-middle-income economies are those in which 2015 GNI per capita was between $4,036 and $12,475.",
    "TableName": "Upper middle income",
    "": ""
  },
  {
    "Country Code": "URY",
    "Region": "Latin America & Caribbean",
    "IncomeGroup": "High income",
    "SpecialNotes": "In 2011, the Central Bank revised national accounts data for 2006 onward.",
    "TableName": "Uruguay",
    "": ""
  },
  {
    "Country Code": "USA",
    "Region": "North America",
    "IncomeGroup": "High income",
    "SpecialNotes": "Fiscal year end: September 30; reporting period for national accounts data: CY.",
    "TableName": "United States",
    "": ""
  },
  {
    "Country Code": "UZB",
    "Region": "Europe & Central Asia",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "",
    "TableName": "Uzbekistan",
    "": ""
  },
  {
    "Country Code": "VCT",
    "Region": "Latin America & Caribbean",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "April 2012 database update: Based on official government statistics, national accounts data were revised for 2000 onward; the base year changed to 2006.",
    "TableName": "St. Vincent and the Grenadines",
    "": ""
  },
  {
    "Country Code": "VEN",
    "Region": "Latin America & Caribbean",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "",
    "TableName": "Venezuela, RB",
    "": ""
  },
  {
    "Country Code": "VGB",
    "Region": "Latin America & Caribbean",
    "IncomeGroup": "High income",
    "SpecialNotes": "",
    "TableName": "British Virgin Islands",
    "": ""
  },
  {
    "Country Code": "VIR",
    "Region": "Latin America & Caribbean",
    "IncomeGroup": "High income",
    "SpecialNotes": "",
    "TableName": "Virgin Islands (U.S.)",
    "": ""
  },
  {
    "Country Code": "VNM",
    "Region": "East Asia & Pacific",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "National accounts value added data are now reported at basic prices.",
    "TableName": "Vietnam",
    "": ""
  },
  {
    "Country Code": "VUT",
    "Region": "East Asia & Pacific",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "2013 national accounts estimates are based on IMF reports. Based on official government statistics, value added is measured at producer prices through 1997 and at basic prices from 1998 onward.",
    "TableName": "Vanuatu",
    "": ""
  },
  {
    "Country Code": "WLD",
    "Region": "",
    "IncomeGroup": "",
    "SpecialNotes": "World aggregate.",
    "TableName": "World",
    "": ""
  },
  {
    "Country Code": "WSM",
    "Region": "East Asia & Pacific",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "Fiscal year ends on June 30; reporting period for national accounts data: FY. Data are revised from Samoa Bureau of Statistics and Central Bank of Samoa. The new base year is 2008/09. Other methodological changes include increased reliance on summary data from the country’s Value Added Goods and Services Tax system, incorporation of more recent benchmarks, and use of improved data sources.",
    "TableName": "Samoa",
    "": ""
  },
  {
    "Country Code": "YEM",
    "Region": "Middle East & North Africa",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "Based on official government statistics and International Monetary Fund data, national accounts data have been revised for 1990 onward. The new base year is 2007.",
    "TableName": "Yemen, Rep.",
    "": ""
  },
  {
    "Country Code": "ZAF",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Upper middle income",
    "SpecialNotes": "Fiscal year end: March 31; reporting period for national accounts data: CY. The new base year is 2010. South Africa reports using SNA 2008.",
    "TableName": "South Africa",
    "": ""
  },
  {
    "Country Code": "ZMB",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Lower middle income",
    "SpecialNotes": "The new base year is 2010. National accounts data were rebased to reflect the January 1, 2013, introduction of the new Zambian kwacha at a rate of 1,000 old kwacha = 1 new kwacha. Zambia reports using SNA 2008.",
    "TableName": "Zambia",
    "": ""
  },
  {
    "Country Code": "ZWE",
    "Region": "Sub-Saharan Africa",
    "IncomeGroup": "Low income",
    "SpecialNotes": "Fiscal year end: June 30; reporting period for national accounts data: CY. As of January 2009, multiple hard currencies, such as rand, pound sterling, euro and U.S. dollar are in use. Data are reported in U.S. dollars, the most-used currency.",
    "TableName": "Zimbabwe",
    "": ""
  }
];

function elPost(events){
  var def1 = deferred(), stmts=[];
  for(var i=0;i<events.length;i++){
    stmts.push({ index:  { _index: 'unemp', _type: 'c_unemp' } });
    stmts.push(events[i]);
  }
  client.bulk({
    body: stmts
  }, function (error, response) {
      def1.resolve();
  });
  return def1.promise;
}

var createEvent = function(ct){
    var dataObj  = data[ct];
    var toAdd = [];
    for(var i=0;i<ccodes.length;i++){
      //console.log(ccodes[i]["Country Code"] + " --- " + dataObj["Country Code"]);
      if(ccodes[i]["Country Code"] == dataObj["Country Code"] && ccodes[i]["Region"].toLowerCase().indexOf("africa")>-1){
        for(var yr in dataObj){
            yrV = parseInt(yr);
            if(yrV != NaN && yrV > 1990 && yrV < 2015){
              var obj = {"ccode" : dataObj["Country Code"], "country" : dataObj["Country Name"]};
              obj["yr"] = yrV;
              var value = parseFloat(dataObj[yr]);
              obj["value"] = value.toString() != "NaN" ? value  : 0;
              toAdd.push(obj);
            }
        }
      }
    }
    return toAdd;
};

var parser = function(d ){
  data = JSON.parse(d);
  var toPost = [];
  for(var i=0;i<data.length;i++){
    toPost = toPost.concat(createEvent(i));
  }
  var promise = elPost(toPost);
  promise.done(function(){
    console.log("posted");
  });
};

parser(fs.readFileSync("unemployment.json"));

