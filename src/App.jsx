import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, CartesianGrid, Cell, Legend, Area, AreaChart, ComposedChart } from "recharts";

const REGIONS = {
  North:["DL","UP","UK","HP","HR","PB","JK","CH","RJ"],South:["TN","KL","KA","AP","TS","PY","LD"],
  East:["WB","OD","BR","JH"],West:["MH","GJ","GA","DN","DD"],Central:["MP","CG"],
  Northeast:["AS","TR","MN","MZ","ML","NL","AR","SK"],Islands:["AN"],
};
function getRegion(st){for(const[r,ss]of Object.entries(REGIONS))if(ss.includes(st))return r;return"Other";}
const REGION_COLORS={North:"#f59e0b",South:"#10b981",East:"#6366f1",West:"#ef4444",Central:"#8b5cf6",Northeast:"#06b6d4",Islands:"#ec4899"};

const INDIAN_CITIES=[
{n:"Mumbai",s:"MH",lat:19.076,lon:72.8777},{n:"Delhi",s:"DL",lat:28.6139,lon:77.209},{n:"Bangalore",s:"KA",lat:12.9716,lon:77.5946},
{n:"Hyderabad",s:"TS",lat:17.385,lon:78.4867},{n:"Ahmedabad",s:"GJ",lat:23.0225,lon:72.5714},{n:"Chennai",s:"TN",lat:13.0827,lon:80.2707},
{n:"Kolkata",s:"WB",lat:22.5726,lon:88.3639},{n:"Pune",s:"MH",lat:18.5204,lon:73.8567},{n:"Jaipur",s:"RJ",lat:26.9124,lon:75.7873},
{n:"Lucknow",s:"UP",lat:26.8467,lon:80.9462},{n:"Kanpur",s:"UP",lat:26.4499,lon:80.3319},{n:"Nagpur",s:"MH",lat:21.1458,lon:79.0882},
{n:"Indore",s:"MP",lat:22.7196,lon:75.8577},{n:"Thane",s:"MH",lat:19.2183,lon:72.9781},{n:"Bhopal",s:"MP",lat:23.2599,lon:77.4126},
{n:"Visakhapatnam",s:"AP",lat:17.6868,lon:83.2185},{n:"Patna",s:"BR",lat:25.6093,lon:85.1376},{n:"Vadodara",s:"GJ",lat:22.3072,lon:73.1812},
{n:"Ghaziabad",s:"UP",lat:28.6692,lon:77.4538},{n:"Ludhiana",s:"PB",lat:30.901,lon:75.8573},{n:"Agra",s:"UP",lat:27.1767,lon:78.0081},
{n:"Nashik",s:"MH",lat:19.9975,lon:73.7898},{n:"Faridabad",s:"HR",lat:28.4089,lon:77.3178},{n:"Meerut",s:"UP",lat:28.9845,lon:77.7064},
{n:"Rajkot",s:"GJ",lat:22.3039,lon:70.8022},{n:"Varanasi",s:"UP",lat:25.3176,lon:82.9739},{n:"Srinagar",s:"JK",lat:34.0837,lon:74.7973},
{n:"Aurangabad",s:"MH",lat:19.8762,lon:75.3433},{n:"Dhanbad",s:"JH",lat:23.7957,lon:86.4304},{n:"Amritsar",s:"PB",lat:31.634,lon:74.8723},
{n:"Allahabad",s:"UP",lat:25.4358,lon:81.8463},{n:"Ranchi",s:"JH",lat:23.3441,lon:85.3096},{n:"Howrah",s:"WB",lat:22.5958,lon:88.2636},
{n:"Coimbatore",s:"TN",lat:11.0168,lon:76.9558},{n:"Jabalpur",s:"MP",lat:23.1815,lon:79.9864},{n:"Gwalior",s:"MP",lat:26.2183,lon:78.1828},
{n:"Vijayawada",s:"AP",lat:16.5062,lon:80.648},{n:"Jodhpur",s:"RJ",lat:26.2389,lon:73.0243},{n:"Madurai",s:"TN",lat:9.9252,lon:78.1198},
{n:"Raipur",s:"CG",lat:21.2514,lon:81.6296},{n:"Kota",s:"RJ",lat:25.2138,lon:75.8648},{n:"Chandigarh",s:"CH",lat:30.7333,lon:76.7794},
{n:"Guwahati",s:"AS",lat:26.1445,lon:91.7362},{n:"Solapur",s:"MH",lat:17.6599,lon:75.9064},{n:"Hubli",s:"KA",lat:15.3647,lon:75.124},
{n:"Bareilly",s:"UP",lat:28.367,lon:79.4304},{n:"Moradabad",s:"UP",lat:28.8386,lon:78.7733},{n:"Mysore",s:"KA",lat:12.2958,lon:76.6394},
{n:"Gurgaon",s:"HR",lat:28.4595,lon:77.0266},{n:"Aligarh",s:"UP",lat:27.8974,lon:78.088},{n:"Jalandhar",s:"PB",lat:31.326,lon:75.5762},
{n:"Tiruchirappalli",s:"TN",lat:10.7905,lon:78.7047},{n:"Bhubaneswar",s:"OD",lat:20.2961,lon:85.8245},{n:"Salem",s:"TN",lat:11.6643,lon:78.146},
{n:"Thiruvananthapuram",s:"KL",lat:8.5241,lon:76.9366},{n:"Warangal",s:"TS",lat:17.9784,lon:79.5941},{n:"Guntur",s:"AP",lat:16.3067,lon:80.4365},
{n:"Bhiwandi",s:"MH",lat:19.2813,lon:73.0483},{n:"Saharanpur",s:"UP",lat:29.9681,lon:77.5464},{n:"Gorakhpur",s:"UP",lat:26.7606,lon:83.3732},
{n:"Bikaner",s:"RJ",lat:28.0229,lon:73.3119},{n:"Amravati",s:"MH",lat:20.9374,lon:77.7796},{n:"Noida",s:"UP",lat:28.5355,lon:77.391},
{n:"Jamshedpur",s:"JH",lat:22.8046,lon:86.2029},{n:"Bhilai",s:"CG",lat:21.2094,lon:81.3784},{n:"Cuttack",s:"OD",lat:20.4625,lon:85.8828},
{n:"Firozabad",s:"UP",lat:27.1591,lon:78.3957},{n:"Kochi",s:"KL",lat:9.9312,lon:76.2673},{n:"Nellore",s:"AP",lat:14.4426,lon:79.9865},
{n:"Bhavnagar",s:"GJ",lat:21.7645,lon:72.1519},{n:"Dehradun",s:"UK",lat:30.3165,lon:78.0322},{n:"Durgapur",s:"WB",lat:23.5204,lon:87.3119},
{n:"Asansol",s:"WB",lat:23.6739,lon:86.9524},{n:"Rourkela",s:"OD",lat:22.2604,lon:84.8536},{n:"Nanded",s:"MH",lat:19.1383,lon:77.321},
{n:"Kolhapur",s:"MH",lat:16.705,lon:74.2433},{n:"Ajmer",s:"RJ",lat:26.4499,lon:74.6399},{n:"Akola",s:"MH",lat:20.7002,lon:77.0082},
{n:"Gulbarga",s:"KA",lat:17.3297,lon:76.8343},{n:"Jamnagar",s:"GJ",lat:22.4707,lon:70.0577},{n:"Ujjain",s:"MP",lat:23.1765,lon:75.7885},
{n:"Loni",s:"UP",lat:28.7502,lon:77.2713},{n:"Siliguri",s:"WB",lat:26.7271,lon:88.3953},{n:"Jhansi",s:"UP",lat:25.4484,lon:78.5685},
{n:"Ulhasnagar",s:"MH",lat:19.2183,lon:73.1631},{n:"Jammu",s:"JK",lat:32.7266,lon:74.857},{n:"Sangli",s:"MH",lat:16.8524,lon:74.5815},
{n:"Mangalore",s:"KA",lat:12.9141,lon:74.856},{n:"Erode",s:"TN",lat:11.341,lon:77.7172},{n:"Belgaum",s:"KA",lat:15.8497,lon:74.4977},
{n:"Ambattur",s:"TN",lat:13.1143,lon:80.1548},{n:"Tirunelveli",s:"TN",lat:8.7139,lon:77.7567},{n:"Malegaon",s:"MH",lat:20.5548,lon:74.5247},
{n:"Gaya",s:"BR",lat:24.7955,lon:84.9994},{n:"Udaipur",s:"RJ",lat:24.5854,lon:73.7125},{n:"Kakinada",s:"AP",lat:16.9891,lon:82.2475},
{n:"Davanagere",s:"KA",lat:14.4644,lon:75.9218},{n:"Kozhikode",s:"KL",lat:11.2588,lon:75.7804},{n:"Maheshtala",s:"WB",lat:22.5098,lon:88.2553},
{n:"Rajpur Sonarpur",s:"WB",lat:22.449,lon:88.3916},{n:"Bokaro",s:"JH",lat:23.6693,lon:86.151},{n:"South Dumdum",s:"WB",lat:22.6264,lon:88.3981},
{n:"Bellary",s:"KA",lat:15.1394,lon:76.9214},{n:"Patiala",s:"PB",lat:30.3398,lon:76.3869},{n:"Gopalpur",s:"OD",lat:19.2583,lon:84.9052},
{n:"Agartala",s:"TR",lat:23.8315,lon:91.2868},{n:"Bhagalpur",s:"BR",lat:25.2425,lon:86.9842},{n:"Muzaffarnagar",s:"UP",lat:29.4727,lon:77.7085},
{n:"Bhatpara",s:"WB",lat:22.8664,lon:88.4088},{n:"Panihati",s:"WB",lat:22.6936,lon:88.3702},{n:"Latur",s:"MH",lat:18.4088,lon:76.5604},
{n:"Dhule",s:"MH",lat:20.9042,lon:74.7749},{n:"Tirupati",s:"AP",lat:13.6288,lon:79.4192},{n:"Rohtak",s:"HR",lat:28.8955,lon:76.6066},
{n:"Korba",s:"CG",lat:22.3595,lon:82.7501},{n:"Bhilwara",s:"RJ",lat:25.3407,lon:74.6313},{n:"Berhampur",s:"OD",lat:19.315,lon:84.7941},
{n:"Muzaffarpur",s:"BR",lat:26.1197,lon:85.391},{n:"Ahmednagar",s:"MH",lat:19.0948,lon:74.748},{n:"Mathura",s:"UP",lat:27.4924,lon:77.6737},
{n:"Kollam",s:"KL",lat:8.8932,lon:76.6141},{n:"Avadi",s:"TN",lat:13.1067,lon:80.1099},{n:"Kadapa",s:"AP",lat:14.4674,lon:78.8241},
{n:"Kamarhati",s:"WB",lat:22.6723,lon:88.3743},{n:"Sambalpur",s:"OD",lat:21.4669,lon:83.9812},{n:"Bilaspur",s:"CG",lat:22.0797,lon:82.1409},
{n:"Shahjahanpur",s:"UP",lat:27.8834,lon:79.9108},{n:"Satara",s:"MH",lat:17.6805,lon:74.0183},{n:"Bijapur",s:"KA",lat:16.8302,lon:75.71},
{n:"Rampur",s:"UP",lat:28.793,lon:79.025},{n:"Shimoga",s:"KA",lat:13.9299,lon:75.5681},{n:"Chandrapur",s:"MH",lat:19.9615,lon:79.2961},
{n:"Junagadh",s:"GJ",lat:21.5222,lon:70.4579},{n:"Thrissur",s:"KL",lat:10.5276,lon:76.2144},{n:"Alwar",s:"RJ",lat:27.553,lon:76.6346},
{n:"Bardhaman",s:"WB",lat:23.2324,lon:87.8615},{n:"Kulti",s:"WB",lat:23.7289,lon:86.8497},{n:"Nizamabad",s:"TS",lat:18.6725,lon:78.0941},
{n:"Parbhani",s:"MH",lat:19.2608,lon:76.7748},{n:"Tumkur",s:"KA",lat:13.3379,lon:77.1173},{n:"Khammam",s:"TS",lat:17.2473,lon:80.1514},
{n:"Ozhukarai",s:"PY",lat:11.9559,lon:79.7677},{n:"Bihar Sharif",s:"BR",lat:25.1982,lon:85.5199},{n:"Panipat",s:"HR",lat:29.3909,lon:76.9635},
{n:"Darbhanga",s:"BR",lat:26.1542,lon:85.8918},{n:"Bally",s:"WB",lat:22.65,lon:88.34},{n:"Aizawl",s:"MZ",lat:23.7271,lon:92.7176},
{n:"Dewas",s:"MP",lat:22.9623,lon:76.0508},{n:"Ichalkaranji",s:"MH",lat:16.6913,lon:74.4596},{n:"Karnal",s:"HR",lat:29.6857,lon:76.9905},
{n:"Bathinda",s:"PB",lat:30.211,lon:74.9455},{n:"Jalna",s:"MH",lat:19.8347,lon:75.8816},{n:"Eluru",s:"AP",lat:16.7107,lon:81.0952},
{n:"Barasat",s:"WB",lat:22.7197,lon:88.48},{n:"Kirari Suleman Nagar",s:"DL",lat:28.7667,lon:77.05},{n:"Purnia",s:"BR",lat:25.7771,lon:87.4753},
{n:"Satna",s:"MP",lat:24.5658,lon:80.8321},{n:"Mau",s:"UP",lat:25.9419,lon:83.5613},{n:"Sonipat",s:"HR",lat:28.9286,lon:77.0914},
{n:"Farrukhabad",s:"UP",lat:27.3906,lon:79.5803},{n:"Sagar",s:"MP",lat:23.8388,lon:78.7378},{n:"Rewa",s:"MP",lat:24.5311,lon:81.298},
{n:"Durg",s:"CG",lat:21.1904,lon:81.2849},{n:"Imphal",s:"MN",lat:24.817,lon:93.9368},{n:"Ratlam",s:"MP",lat:23.334,lon:75.0367},
{n:"Hapur",s:"UP",lat:28.7309,lon:77.7759},{n:"Arrah",s:"BR",lat:25.5541,lon:84.6603},{n:"Anantapur",s:"AP",lat:14.6819,lon:77.6006},
{n:"Karimnagar",s:"TS",lat:18.4386,lon:79.1288},{n:"Etawah",s:"UP",lat:26.7856,lon:79.0158},{n:"Ambernath",s:"MH",lat:19.2094,lon:73.1847},
{n:"North Dumdum",s:"WB",lat:22.66,lon:88.41},{n:"Bharatpur",s:"RJ",lat:27.2152,lon:77.503},{n:"Begusarai",s:"BR",lat:25.4182,lon:86.1272},
{n:"New Delhi",s:"DL",lat:28.6353,lon:77.225},{n:"Gandhidham",s:"GJ",lat:23.0753,lon:70.1337},{n:"Baranagar",s:"WB",lat:22.6375,lon:88.3697},
{n:"Tiruvottiyur",s:"TN",lat:13.16,lon:80.3},{n:"Pondicherry",s:"PY",lat:11.9416,lon:79.8083},{n:"Sikar",s:"RJ",lat:27.6094,lon:75.1399},
{n:"Thoothukudi",s:"TN",lat:8.7642,lon:78.1348},{n:"Mirzapur",s:"UP",lat:25.1337,lon:82.5645},{n:"Raichur",s:"KA",lat:16.2076,lon:77.3463},
{n:"Pali",s:"RJ",lat:25.7711,lon:73.3234},{n:"Ramagundam",s:"TS",lat:18.7557,lon:79.45},{n:"Haridwar",s:"UK",lat:29.9457,lon:78.1642},
{n:"Vizianagaram",s:"AP",lat:18.1067,lon:83.3956},{n:"Katihar",s:"BR",lat:25.5398,lon:87.5715},{n:"Nagercoil",s:"TN",lat:8.1833,lon:77.4119},
{n:"Sri Ganganagar",s:"RJ",lat:29.9038,lon:73.8772},{n:"Karawal Nagar",s:"DL",lat:28.7617,lon:77.2953},{n:"Mango",s:"JH",lat:22.8313,lon:86.2186},
{n:"Thanjavur",s:"TN",lat:10.787,lon:79.1378},{n:"Bulandshahr",s:"UP",lat:28.407,lon:77.8498},{n:"Naihati",s:"WB",lat:22.8894,lon:88.422},
{n:"Sambhal",s:"UP",lat:28.5904,lon:78.5718},{n:"Nadiad",s:"GJ",lat:22.6916,lon:72.8634},{n:"Yamunanagar",s:"HR",lat:30.129,lon:77.2674},
{n:"English Bazar",s:"WB",lat:25.0026,lon:88.146},{n:"Rae Bareli",s:"UP",lat:26.2345,lon:81.2326},{n:"Narasaraopet",s:"AP",lat:16.2357,lon:80.0494},
{n:"Gangtok",s:"SK",lat:27.3389,lon:88.6065},{n:"Shimla",s:"HP",lat:31.1048,lon:77.1734},{n:"Itanagar",s:"AR",lat:27.0844,lon:93.6053},
{n:"Shillong",s:"ML",lat:25.5788,lon:91.8933},{n:"Kohima",s:"NL",lat:25.6751,lon:94.1086},{n:"Dimapur",s:"NL",lat:25.9042,lon:93.7266},
{n:"Panaji",s:"GA",lat:15.4909,lon:73.8278},{n:"Silvassa",s:"DN",lat:20.2737,lon:72.9962},{n:"Daman",s:"DD",lat:20.3974,lon:72.8328},
{n:"Kavaratti",s:"LD",lat:10.5593,lon:72.6358},{n:"Port Blair",s:"AN",lat:11.6234,lon:92.7265},{n:"Dharamshala",s:"HP",lat:32.219,lon:76.3234},
].map(c=>({...c,region:getRegion(c.s)}));

const INDIA_BORDER=[[8.07,77.55],[8.18,77.3],[8.28,77.1],[8.4,76.95],[8.55,76.82],[8.7,76.72],[8.88,76.62],[9.05,76.55],[9.25,76.48],[9.48,76.4],[9.7,76.32],[9.95,76.25],[10.15,76.2],[10.38,76.12],[10.58,76.02],[10.8,75.95],[11.02,75.8],[11.25,75.65],[11.48,75.5],[11.72,75.38],[11.95,75.22],[12.15,75.02],[12.35,74.9],[12.58,74.85],[12.8,74.82],[13.05,74.78],[13.3,74.72],[13.55,74.65],[13.78,74.58],[14.02,74.48],[14.25,74.35],[14.48,74.22],[14.72,74.12],[14.95,74.05],[15.18,73.92],[15.38,73.85],[15.55,73.75],[15.78,73.65],[16.02,73.52],[16.25,73.42],[16.52,73.35],[16.78,73.28],[17.05,73.22],[17.32,73.15],[17.58,73.1],[17.85,73.05],[18.1,72.98],[18.38,72.92],[18.62,72.88],[18.88,72.85],[19.12,72.88],[19.35,72.82],[19.58,72.82],[19.82,72.85],[20.05,72.8],[20.28,72.72],[20.52,72.62],[20.78,72.48],[21.02,72.3],[21.22,72.12],[21.42,71.78],[21.52,71.55],[21.48,71.3],[21.25,71.05],[21.05,70.82],[20.88,70.72],[20.72,70.95],[20.92,71.22],[21.12,71.48],[21.32,71.72],[21.18,72.05],[20.92,72.28],[20.68,72.48],[20.88,70.5],[21.08,70.3],[21.28,70.18],[21.55,70.22],[21.82,70.35],[22.08,69.92],[22.35,69.55],[22.62,69.18],[22.88,68.82],[23.12,68.52],[23.38,68.38],[23.62,68.22],[23.82,68.18],[23.95,68.35],[23.97,68.72],[24.28,68.78],[24.28,69.05],[24.18,70.05],[24.48,70.55],[24.52,71.02],[24.88,70.98],[25.22,70.12],[25.8,69.65],[26.52,69.48],[27.05,69.78],[27.55,70.02],[28.02,70.42],[28.52,70.72],[29.05,71.12],[29.52,71.52],[30.02,72.02],[30.52,72.32],[30.82,72.62],[31.05,73.02],[31.25,73.22],[31.42,73.52],[31.62,73.82],[31.82,74.08],[32.05,74.22],[32.28,74.32],[32.52,74.05],[32.72,74.12],[32.95,74.32],[33.15,73.82],[33.38,74.02],[33.58,74.25],[33.78,74.42],[33.98,74.62],[34.18,74.72],[34.38,74.82],[34.55,74.62],[34.72,74.42],[34.92,74.62],[35.12,74.82],[35.32,75.02],[35.52,75.22],[35.65,75.52],[35.75,75.82],[35.82,76.12],[35.88,76.42],[35.92,76.78],[35.85,77.12],[35.72,77.42],[35.52,77.62],[35.32,77.82],[35.08,78.02],[34.78,78.22],[34.48,78.42],[34.18,78.62],[33.88,78.78],[33.58,78.82],[33.28,78.72],[32.98,78.95],[32.68,79.18],[32.38,79.35],[32.08,79.48],[31.78,79.58],[31.48,79.68],[31.18,79.78],[30.95,79.65],[30.72,79.48],[30.48,79.35],[30.32,80.15],[30.08,80.32],[29.78,80.58],[29.52,80.78],[29.28,80.52],[29.08,80.22],[28.88,80.32],[28.72,80.78],[28.58,81.02],[28.48,81.32],[28.38,81.62],[28.28,81.92],[28.18,82.22],[28.08,82.52],[27.98,82.82],[27.88,83.12],[27.82,83.42],[27.78,83.72],[27.72,84.02],[27.68,84.32],[27.62,84.62],[27.58,84.92],[27.52,85.22],[27.48,85.52],[27.52,85.78],[27.55,86.02],[27.48,86.32],[27.42,86.62],[27.32,86.92],[27.22,87.12],[27.12,87.38],[27.02,87.62],[26.92,87.82],[26.85,88.02],[26.82,88.18],[27.02,88.22],[27.18,88.35],[27.35,88.48],[27.48,88.68],[27.42,88.92],[27.28,89.15],[27.12,89.38],[27.02,89.58],[26.92,89.78],[26.82,89.92],[26.78,89.68],[26.68,89.85],[26.58,90.12],[26.48,90.42],[26.38,90.62],[26.28,90.82],[26.18,91.02],[26.08,91.28],[25.98,91.52],[25.88,91.72],[25.78,91.92],[25.65,92.18],[25.48,92.08],[25.28,92.02],[25.08,92.12],[24.85,92.18],[24.62,92.08],[24.38,92.02],[24.18,92.08],[23.95,92.15],[23.72,92.22],[23.48,92.28],[23.25,92.38],[23.02,92.48],[22.78,92.52],[22.55,92.48],[22.32,92.38],[22.08,92.25],[21.88,92.18],[21.98,92.35],[22.18,92.55],[22.42,92.75],[22.62,92.92],[22.85,93.12],[23.08,93.28],[23.32,93.38],[23.55,93.45],[23.78,93.52],[24.02,93.65],[24.28,93.78],[24.52,93.88],[24.78,93.98],[25.02,94.08],[25.28,94.22],[25.52,94.32],[25.78,94.38],[25.98,94.52],[26.18,94.62],[26.42,94.78],[26.65,94.95],[26.88,95.18],[27.08,95.42],[27.32,95.68],[27.55,95.92],[27.78,96.15],[27.98,96.42],[28.12,96.72],[28.25,97.02],[28.35,97.18],[28.22,96.85],[28.08,96.52],[27.95,96.22],[27.82,95.88],[27.72,95.55],[27.62,95.22],[27.52,94.88],[27.55,94.55],[27.65,94.22],[27.75,93.88],[27.85,93.55],[27.95,93.22],[28.05,92.88],[28.08,92.55],[27.98,92.22],[27.88,91.92],[27.78,91.62],[27.68,91.32],[27.62,91.02],[27.55,90.72],[27.48,90.42],[27.42,90.12],[27.38,89.82],[27.28,89.55],[27.15,89.32],[27.05,89.12],[26.95,88.95],[26.82,88.78],[26.72,88.62],[26.52,88.48],[26.32,88.38],[26.12,88.28],[25.92,88.22],[25.72,88.32],[25.52,88.48],[25.32,88.65],[25.18,88.82],[25.05,88.92],[24.92,88.78],[24.72,88.58],[24.52,88.38],[24.32,88.28],[24.12,88.38],[23.92,88.52],[23.72,88.62],[23.52,88.72],[23.32,88.78],[23.12,88.68],[22.92,88.55],[22.72,88.48],[22.52,88.42],[22.32,88.52],[22.12,88.62],[21.95,88.72],[21.85,88.82],[21.68,88.48],[21.58,88.28],[21.62,88.05],[21.72,87.82],[21.72,87.55],[21.68,87.38],[21.52,87.22],[21.35,87.02],[21.18,86.88],[20.98,86.78],[20.78,86.65],[20.58,86.48],[20.38,86.28],[20.22,86.08],[20.05,85.85],[19.88,85.65],[19.72,85.45],[19.55,85.25],[19.38,85.05],[19.22,84.85],[19.05,84.65],[18.88,84.42],[18.68,84.22],[18.48,84.02],[18.28,83.78],[18.08,83.55],[17.88,83.32],[17.68,83.08],[17.48,82.82],[17.28,82.55],[17.08,82.25],[16.88,81.95],[16.68,81.62],[16.48,81.32],[16.28,81.08],[16.05,80.82],[15.82,80.58],[15.62,80.42],[15.38,80.32],[15.15,80.22],[14.92,80.18],[14.68,80.15],[14.42,80.18],[14.18,80.22],[13.95,80.25],[13.72,80.28],[13.48,80.3],[13.25,80.3],[13.02,80.28],[12.78,80.22],[12.55,80.18],[12.32,80.12],[12.08,80.05],[11.85,79.95],[11.62,79.88],[11.38,79.85],[11.15,79.88],[10.92,79.82],[10.68,79.78],[10.45,79.85],[10.22,79.78],[10.02,79.68],[9.82,79.48],[9.62,79.32],[9.45,79.25],[9.28,79.18],[9.12,78.92],[8.98,78.68],[8.85,78.42],[8.72,78.18],[8.58,77.98],[8.45,77.82],[8.32,77.7],[8.22,77.62],[8.07,77.55]];

const BATCH=15;
function fmtD(d){return d.toISOString().split("T")[0];}
function shortDay(ds){const d=new Date(ds+"T00:00:00");return d.toLocaleDateString("en-IN",{day:"numeric",month:"short"});}
function weekday(ds){const d=new Date(ds+"T00:00:00");return d.toLocaleDateString("en-IN",{weekday:"short"});}

async function fetchForecast(cities){
  const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${cities.map(c=>c.lat).join(",")}&longitude=${cities.map(c=>c.lon).join(",")}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=8&timezone=Asia/Kolkata`);
  if(!r.ok)throw new Error(`${r.status}`);const d=await r.json();return Array.isArray(d)?d:[d];
}
async function fetchHist(cities,ds){
  const r=await fetch(`https://archive-api.open-meteo.com/v1/archive?latitude=${cities.map(c=>c.lat).join(",")}&longitude=${cities.map(c=>c.lon).join(",")}&daily=temperature_2m_max,temperature_2m_min&start_date=${ds}&end_date=${ds}&timezone=Asia/Kolkata`);
  if(!r.ok)throw new Error(`${r.status}`);const d=await r.json();return Array.isArray(d)?d:[d];
}

function lerp(a,b,t){return a+(b-a)*t;}
function lerpColor(c1,c2,t){return[lerp(c1[0],c2[0],t),lerp(c1[1],c2[1],t),lerp(c1[2],c2[2],t)];}
function rgbStr(c){return`rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`;}
function tempColor(v,min,max){if(v==null)return"#333";const stops=[[30,60,180],[50,130,220],[80,200,180],[140,220,80],[220,200,50],[240,140,30],[220,50,30]];const t=Math.max(0,Math.min(1,(v-min)/(max-min||1)));const idx=t*(stops.length-1);const lo=Math.floor(idx),hi=Math.min(lo+1,stops.length-1);return rgbStr(lerpColor(stops[lo],stops[hi],idx-lo));}
function devColor(v){if(v==null)return"#333";const stops=[[20,60,200],[60,130,240],[130,190,240],[200,210,210],[240,200,100],[240,140,40],[220,40,30]];const t=Math.max(0,Math.min(1,(v+6)/12));const idx=t*(stops.length-1);const lo=Math.floor(idx),hi=Math.min(lo+1,stops.length-1);return rgbStr(lerpColor(stops[lo],stops[hi],idx-lo));}
function rainColor(v){if(v==null)return"#334155";if(v>=70)return"#2563eb";if(v>=40)return"#60a5fa";if(v>=20)return"#93c5fd";return"#334155";}

function DevBadge({value}){if(value==null||isNaN(value))return<span style={{color:"#555"}}>—</span>;let bg;if(value>3)bg="#dc2626";else if(value>1.5)bg="#ea580c";else if(value>0)bg="#ca8a04";else if(value>-1.5)bg="#60a5fa";else if(value>-3)bg="#2563eb";else bg="#1d4ed8";const fg=(value>0&&value<=1.5)?"#1a1a1a":"#fff";return<span style={{background:bg,color:fg,padding:"2px 7px",borderRadius:"4px",fontWeight:600,fontSize:"11px",fontFamily:"'JetBrains Mono',monospace",display:"inline-block",minWidth:"52px",textAlign:"center"}}>{value>0?"+":""}{value.toFixed(1)}°</span>;}
function RegionTag({region}){const c=REGION_COLORS[region]||"#888";return<span style={{background:c+"18",color:c,border:`1px solid ${c}44`,padding:"1px 7px",borderRadius:"10px",fontSize:"10px",fontWeight:600,whiteSpace:"nowrap"}}>{region}</span>;}

function Sparkline({data,dataKey,color,width=120,height=28}){
  if(!data||!data.length)return<span style={{color:"#555"}}>—</span>;
  const vals=data.map(d=>d[dataKey]).filter(v=>v!=null);if(!vals.length)return<span style={{color:"#555"}}>—</span>;
  const mn=Math.min(...vals),mx=Math.max(...vals),range=mx-mn||1;
  const pts=vals.map((v,i)=>`${(i/(vals.length-1))*width},${height-((v-mn)/range)*(height-4)-2}`).join(" ");
  return<svg width={width} height={height} style={{display:"block"}}><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>{vals.map((v,i)=><circle key={i} cx={(i/(vals.length-1))*width} cy={height-((v-mn)/range)*(height-4)-2} r="2" fill={color}/>)}</svg>;
}

// ─── MAP ────────────────────────────────────────────────────────
const MAP_W=620,MAP_H=700,LAT_MIN=6.5,LAT_MAX=37.5,LON_MIN=67,LON_MAX=98;
function geoToSvg(lat,lon){return{x:30+((lon-LON_MIN)/(LON_MAX-LON_MIN))*(MAP_W-60),y:20+((LAT_MAX-lat)/(LAT_MAX-LAT_MIN))*(MAP_H-50)};}

function IndiaMap({data,regionFilter,searchTerm}){
  const[colorBy,setColorBy]=useState("deviation_max");const[hovered,setHovered]=useState(null);const[mousePos,setMousePos]=useState({x:0,y:0});const svgRef=useRef(null);
  const filtered=useMemo(()=>{let d=data;if(regionFilter!=="ALL")d=d.filter(r=>r.region===regionFilter);if(searchTerm)d=d.filter(r=>r.city.toLowerCase().includes(searchTerm.toLowerCase()));return d;},[data,regionFilter,searchTerm]);
  const{vMin,vMax}=useMemo(()=>{const vals=filtered.map(d=>d[colorBy]).filter(v=>v!=null);if(!vals.length)return{vMin:0,vMax:40};return{vMin:Math.min(...vals),vMax:Math.max(...vals)};},[filtered,colorBy]);
  const getColor=useCallback((val)=>{if(colorBy.startsWith("deviation"))return devColor(val);return tempColor(val,vMin,vMax);},[colorBy,vMin,vMax]);
  const borderPath=useMemo(()=>INDIA_BORDER.map((p,i)=>{const{x,y}=geoToSvg(p[0],p[1]);return`${i===0?"M":"L"}${x.toFixed(1)},${y.toFixed(1)}`;}).join(" ")+" Z",[]);
  const handleMouseMove=useCallback((e)=>{if(!svgRef.current)return;const rect=svgRef.current.getBoundingClientRect();setMousePos({x:e.clientX-rect.left,y:e.clientY-rect.top});},[]);
  const labels={current_max:"Current Max °C",current_min:"Current Min °C",deviation_max:"Max Deviation",deviation_min:"Min Deviation"};
  return(
    <div style={{display:"flex",gap:"16px",flexWrap:"wrap"}}>
      <div style={{flex:"1 1 620px"}}>
        <div style={{display:"flex",gap:"6px",marginBottom:"12px",flexWrap:"wrap",alignItems:"center"}}>
          <span style={{fontSize:"11px",color:"#64748b",marginRight:"4px"}}>Color by:</span>
          {Object.entries(labels).map(([k,l])=>(<button key={k} onClick={()=>setColorBy(k)} style={{background:colorBy===k?"#f9731622":"#111827",border:`1px solid ${colorBy===k?"#f97316":"#1e293b"}`,color:colorBy===k?"#f97316":"#94a3b8",padding:"5px 12px",borderRadius:"6px",fontSize:"11px",cursor:"pointer",fontFamily:"inherit",fontWeight:colorBy===k?600:400}}>{l}</button>))}
        </div>
        <div style={{background:"#0c1120",border:"1px solid #1e293b",borderRadius:"10px",padding:"8px",position:"relative",overflow:"hidden"}}>
          <svg ref={svgRef} viewBox={`0 0 ${MAP_W} ${MAP_H}`} style={{width:"100%",maxWidth:MAP_W,display:"block",margin:"0 auto"}} onMouseMove={handleMouseMove}>
            {[70,75,80,85,90,95].map(lon=>{const{x}=geoToSvg(20,lon);return<line key={`lon${lon}`} x1={x} y1={20} x2={x} y2={MAP_H-30} stroke="#1e293b" strokeWidth="0.5" strokeDasharray="4,4"/>;})}
            {[10,15,20,25,30,35].map(lat=>{const{y}=geoToSvg(lat,80);return<line key={`lat${lat}`} x1={30} y1={y} x2={MAP_W-30} y2={y} stroke="#1e293b" strokeWidth="0.5" strokeDasharray="4,4"/>;})}
            {[10,15,20,25,30,35].map(lat=>{const{y}=geoToSvg(lat,80);return<text key={`lt${lat}`} x={14} y={y+3} fill="#334155" fontSize="8" fontFamily="'JetBrains Mono',monospace">{lat}°</text>;})}
            {[70,75,80,85,90,95].map(lon=>{const{x}=geoToSvg(20,lon);return<text key={`ln${lon}`} x={x-6} y={MAP_H-18} fill="#334155" fontSize="8" fontFamily="'JetBrains Mono',monospace">{lon}°</text>;})}
            <path d={borderPath} fill="#111d30" stroke="#2d4a6f" strokeWidth="1.5" strokeLinejoin="round"/>
            {filtered.map((city,i)=>{const{x,y}=geoToSvg(city.lat,city.lon);const col=getColor(city[colorBy]);const isH=hovered===i;return(<g key={`${city.city}-${i}`} onMouseEnter={()=>setHovered(i)} onMouseLeave={()=>setHovered(null)} style={{cursor:"pointer"}}>{isH&&<circle cx={x} cy={y} r={12} fill={col} opacity={0.2}/>}<circle cx={x} cy={y} r={isH?7:4.5} fill={col} stroke={isH?"#fff":"#0005"} strokeWidth={isH?1.5:0.5}/>{isH&&<text x={x+10} y={y-6} fill="#e2e8f0" fontSize="10" fontWeight="600" fontFamily="'IBM Plex Sans',sans-serif" style={{pointerEvents:"none"}}>{city.city}</text>}</g>);})}
          </svg>
          {hovered!==null&&filtered[hovered]&&(()=>{const c=filtered[hovered];return(<div style={{position:"absolute",left:Math.min(mousePos.x+16,MAP_W-200),top:Math.max(mousePos.y-100,8),background:"#1a2744ee",border:"1px solid #2d4a6f",borderRadius:"8px",padding:"10px 14px",pointerEvents:"none",minWidth:"180px",backdropFilter:"blur(8px)",zIndex:10}}><div style={{fontWeight:700,fontSize:"13px",marginBottom:"4px",color:"#fff"}}>{c.city} <span style={{fontWeight:400,color:"#94a3b8",fontSize:"11px"}}>({c.state})</span></div><RegionTag region={c.region}/><div style={{marginTop:"8px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 16px",fontSize:"11px"}}><span style={{color:"#94a3b8"}}>Max:</span><span style={{color:"#ef4444",fontWeight:600,fontFamily:"'JetBrains Mono',monospace"}}>{c.current_max?.toFixed(1)}°C</span><span style={{color:"#94a3b8"}}>Min:</span><span style={{color:"#60a5fa",fontWeight:600,fontFamily:"'JetBrains Mono',monospace"}}>{c.current_min?.toFixed(1)}°C</span><span style={{color:"#94a3b8"}}>Max Dev:</span><DevBadge value={c.deviation_max}/><span style={{color:"#94a3b8"}}>Min Dev:</span><DevBadge value={c.deviation_min}/></div></div>);})()}
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"4px",padding:"8px 0 2px"}}><span style={{fontSize:"10px",color:"#64748b"}}>{colorBy.startsWith("deviation")?"Cooler":"Cold"}</span><div style={{display:"flex",height:"12px",borderRadius:"3px",overflow:"hidden"}}>{Array.from({length:60},(_,i)=>{const t=i/59;const val=colorBy.startsWith("deviation")?-6+t*12:vMin+t*(vMax-vMin);return<div key={i} style={{width:"4px",height:"12px",background:getColor(val)}}/>;})}</div><span style={{fontSize:"10px",color:"#64748b"}}>{colorBy.startsWith("deviation")?"Hotter":"Hot"}</span></div>
        </div>
      </div>
      <div style={{flex:"0 0 260px",minWidth:"240px"}}>
        <div style={{background:"#111827",border:"1px solid #1e293b",borderRadius:"8px",padding:"14px"}}>
          <div style={{fontSize:"11px",color:"#64748b",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"10px"}}>Region Summary</div>
          {Object.keys(REGIONS).map(reg=>{const cities=filtered.filter(c=>c.region===reg);if(!cities.length)return null;const avgMax=cities.reduce((a,c)=>a+(c.current_max||0),0)/cities.length;const avgDev=cities.reduce((a,c)=>a+(c.deviation_max||0),0)/cities.length;return(<div key={reg} style={{padding:"8px 0",borderBottom:"1px solid #1e293b"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"4px"}}><RegionTag region={reg}/><span style={{fontSize:"10px",color:"#64748b"}}>{cities.length}</span></div><div style={{display:"flex",justifyContent:"space-between",fontSize:"11px",fontFamily:"'JetBrains Mono',monospace"}}><span style={{color:"#94a3b8"}}>Avg: <strong style={{color:"#e2e8f0"}}>{avgMax.toFixed(1)}°</strong></span><DevBadge value={avgDev}/></div></div>);})}
        </div>
        <div style={{background:"#111827",border:"1px solid #1e293b",borderRadius:"8px",padding:"14px",marginTop:"12px"}}>
          <div style={{fontSize:"11px",color:"#64748b",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"8px"}}>🔥 Hottest</div>
          {[...filtered].sort((a,b)=>(b.current_max||0)-(a.current_max||0)).slice(0,5).map((c,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",fontSize:"11px"}}><span style={{color:"#cbd5e1"}}>{c.city}</span><span style={{color:"#ef4444",fontWeight:600,fontFamily:"'JetBrains Mono',monospace"}}>{c.current_max?.toFixed(1)}°</span></div>))}
        </div>
        <div style={{background:"#111827",border:"1px solid #1e293b",borderRadius:"8px",padding:"14px",marginTop:"12px"}}>
          <div style={{fontSize:"11px",color:"#64748b",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"8px"}}>❄️ Coldest</div>
          {[...filtered].sort((a,b)=>(a.current_min||99)-(b.current_min||99)).slice(0,5).map((c,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",fontSize:"11px"}}><span style={{color:"#cbd5e1"}}>{c.city}</span><span style={{color:"#60a5fa",fontWeight:600,fontFamily:"'JetBrains Mono',monospace"}}>{c.current_min?.toFixed(1)}°</span></div>))}
        </div>
      </div>
    </div>
  );
}

// ─── FORECAST TAB ───────────────────────────────────────────────
function ForecastView({data,regionFilter,searchTerm,forecastDates}){
  const[selCity,setSelCity]=useState(null);const[sortBy,setSortBy]=useState("peak_max");const[sortDir,setSortDir]=useState("desc");
  const filtered=useMemo(()=>{let d=data;if(regionFilter!=="ALL")d=d.filter(r=>r.region===regionFilter);if(searchTerm)d=d.filter(r=>r.city.toLowerCase().includes(searchTerm.toLowerCase()));return d;},[data,regionFilter,searchTerm]);
  const regionChartData=useMemo(()=>{
    if(!forecastDates.length)return[];const regs=regionFilter==="ALL"?Object.keys(REGIONS):[regionFilter];
    return forecastDates.map((ds,di)=>{const entry={date:shortDay(ds),day:weekday(ds)};regs.forEach(reg=>{const cities=filtered.filter(c=>c.region===reg&&c.forecast);if(cities.length){entry[reg+"_max"]=+(cities.reduce((a,c)=>a+(c.forecast[di]?.max||0),0)/cities.length).toFixed(1);entry[reg+"_rain"]=Math.round(cities.reduce((a,c)=>a+(c.forecast[di]?.rain||0),0)/cities.length);}});return entry;});
  },[filtered,forecastDates,regionFilter]);
  const sortedCities=useMemo(()=>{
    return[...filtered].filter(c=>c.forecast?.length).sort((a,b)=>{
      if(sortBy==="city")return sortDir==="asc"?a.city.localeCompare(b.city):b.city.localeCompare(a.city);
      let va,vb;if(sortBy==="peak_max"){va=Math.max(...a.forecast.map(f=>f.max||0));vb=Math.max(...b.forecast.map(f=>f.max||0));}
      else{va=Math.max(...a.forecast.map(f=>f.rain||0));vb=Math.max(...b.forecast.map(f=>f.rain||0));}
      return sortDir==="desc"?(vb-va):(va-vb);});
  },[filtered,sortBy,sortDir]);
  const selData=useMemo(()=>{if(selCity==null)return null;const c=filtered[selCity];if(!c||!c.forecast)return null;return c.forecast.map((f,i)=>({date:shortDay(forecastDates[i]),day:weekday(forecastDates[i]),max:f.max,min:f.min,rain:f.rain}));},[selCity,filtered,forecastDates]);
  const handleSort=(k)=>{if(sortBy===k)setSortDir(d=>d==="asc"?"desc":"asc");else{setSortBy(k);setSortDir("desc");}};
  const regs=regionFilter==="ALL"?Object.keys(REGIONS):[regionFilter];
  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px",marginBottom:"16px"}}>
        <div style={{background:"#111827",border:"1px solid #1e293b",borderRadius:"10px",padding:"16px"}}>
          <div style={{fontSize:"13px",fontWeight:600,color:"#e2e8f0",marginBottom:"4px"}}>7-Day Regional Max Temp Forecast</div>
          <div style={{fontSize:"10px",color:"#64748b",marginBottom:"12px"}}>Avg max temperature by region</div>
          <ResponsiveContainer width="100%" height={260}><ComposedChart data={regionChartData} margin={{top:5,right:10,left:0,bottom:5}}><CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/><XAxis dataKey="date" tick={{fontSize:10,fill:"#94a3b8"}} tickLine={false}/><YAxis tick={{fontSize:10,fill:"#94a3b8"}} tickLine={false} unit="°"/><RTooltip contentStyle={{background:"#1a2744",border:"1px solid #2d4a6f",borderRadius:"8px",fontSize:"11px"}} itemStyle={{color:"#e2e8f0"}} labelStyle={{color:"#94a3b8",fontWeight:600}}/><Legend wrapperStyle={{fontSize:"10px"}}/>{regs.map(reg=>(<Line key={reg} type="monotone" dataKey={reg+"_max"} name={reg} stroke={REGION_COLORS[reg]} strokeWidth={2} dot={{r:3}}/>))}</ComposedChart></ResponsiveContainer>
        </div>
        <div style={{background:"#111827",border:"1px solid #1e293b",borderRadius:"10px",padding:"16px"}}>
          <div style={{fontSize:"13px",fontWeight:600,color:"#e2e8f0",marginBottom:"4px"}}>7-Day Regional Rain Probability</div>
          <div style={{fontSize:"10px",color:"#64748b",marginBottom:"12px"}}>Avg precipitation probability (%)</div>
          <ResponsiveContainer width="100%" height={260}><BarChart data={regionChartData} margin={{top:5,right:10,left:0,bottom:5}}><CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/><XAxis dataKey="date" tick={{fontSize:10,fill:"#94a3b8"}} tickLine={false}/><YAxis tick={{fontSize:10,fill:"#94a3b8"}} tickLine={false} unit="%" domain={[0,100]}/><RTooltip contentStyle={{background:"#1a2744",border:"1px solid #2d4a6f",borderRadius:"8px",fontSize:"11px"}} itemStyle={{color:"#e2e8f0"}} labelStyle={{color:"#94a3b8",fontWeight:600}}/><Legend wrapperStyle={{fontSize:"10px"}}/>{regs.map(reg=>(<Bar key={reg} dataKey={reg+"_rain"} name={reg+" %"} fill={REGION_COLORS[reg]} opacity={0.7} radius={[2,2,0,0]}/>))}</BarChart></ResponsiveContainer>
        </div>
      </div>
      <div style={{display:"flex",gap:"16px",flexWrap:"wrap"}}>
        <div style={{flex:"1 1 600px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
            <div style={{fontSize:"13px",fontWeight:600,color:"#e2e8f0"}}>City-wise 7-Day Forecast <span style={{color:"#64748b",fontWeight:400,fontSize:"11px"}}>({sortedCities.length} cities)</span></div>
            <div style={{display:"flex",gap:"6px"}}>{[{k:"peak_max",l:"Peak Max"},{k:"peak_rain",l:"Peak Rain"},{k:"city",l:"A-Z"}].map(s=>(<button key={s.k} onClick={()=>handleSort(s.k)} style={{background:sortBy===s.k?"#f9731622":"#111827",border:`1px solid ${sortBy===s.k?"#f97316":"#1e293b"}`,color:sortBy===s.k?"#f97316":"#94a3b8",padding:"4px 10px",borderRadius:"5px",fontSize:"10px",cursor:"pointer",fontFamily:"inherit"}}>{s.l}{sortBy===s.k?(sortDir==="desc"?" ↓":" ↑"):""}</button>))}</div>
          </div>
          <div style={{overflowX:"auto",borderRadius:"8px",border:"1px solid #1e293b",maxHeight:"520px",overflowY:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:"11px"}}>
              <thead><tr style={{background:"#0f1729",position:"sticky",top:0,zIndex:2}}>
                <th style={{padding:"8px",textAlign:"left",color:"#94a3b8",fontSize:"10px",borderBottom:"2px solid #1e3a5f",whiteSpace:"nowrap",position:"sticky",left:0,background:"#0f1729",zIndex:3}}>City</th>
                <th style={{padding:"8px",textAlign:"center",color:"#94a3b8",fontSize:"10px",borderBottom:"2px solid #1e3a5f"}}>Region</th>
                <th style={{padding:"8px",textAlign:"center",color:"#94a3b8",fontSize:"10px",borderBottom:"2px solid #1e3a5f"}}>Trend</th>
                {forecastDates.map((ds,i)=>(<th key={i} style={{padding:"8px 4px",textAlign:"center",color:"#94a3b8",fontSize:"9px",borderBottom:"2px solid #1e3a5f",whiteSpace:"nowrap"}}><div>{weekday(ds)}</div><div style={{color:"#64748b"}}>{shortDay(ds)}</div></th>))}
              </tr></thead>
              <tbody>{sortedCities.map((row,ri)=>{const bg=ri%2===0?"#080c16":"#0c1120";const origIdx=filtered.indexOf(row);const isSelected=selCity===origIdx;return(<tr key={`${row.city}-${ri}`} onClick={()=>setSelCity(origIdx===selCity?null:origIdx)} style={{cursor:"pointer",background:isSelected?"#1a274433":bg}} className="trow">
                <td style={{padding:"6px 8px",fontWeight:500,whiteSpace:"nowrap",position:"sticky",left:0,background:isSelected?"#1a2744":bg,zIndex:1}}>{row.city} <span style={{color:"#64748b",fontSize:"9px"}}>{row.state}</span></td>
                <td style={{padding:"6px 4px",textAlign:"center"}}><RegionTag region={row.region}/></td>
                <td style={{padding:"6px 4px",textAlign:"center"}}><Sparkline data={row.forecast} dataKey="max" color="#ef4444" width={80} height={24}/></td>
                {row.forecast?.map((f,fi)=>(<td key={fi} style={{padding:"4px 3px",textAlign:"center",background:isSelected?"#1a2744":bg}}>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"11px",fontWeight:600,color:f.max>40?"#ef4444":f.max>35?"#f97316":"#e2e8f0"}}>{f.max?.toFixed(0)}°</div>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",color:"#64748b"}}>{f.min?.toFixed(0)}°</div>
                  {f.rain>20&&<div style={{marginTop:"2px"}}><span style={{fontSize:"8px",padding:"1px 4px",borderRadius:"3px",background:rainColor(f.rain)+"22",color:rainColor(f.rain),fontFamily:"'JetBrains Mono',monospace"}}>🌧{f.rain}%</span></div>}
                </td>))}
              </tr>);})}</tbody>
            </table>
          </div>
        </div>
        <div style={{flex:"0 0 340px",minWidth:"300px"}}>
          {selData&&filtered[selCity]?(<div style={{background:"#111827",border:"1px solid #1e293b",borderRadius:"8px",padding:"14px",position:"sticky",top:"0"}}>
            <div style={{fontSize:"14px",fontWeight:700,color:"#e2e8f0",marginBottom:"2px"}}>{filtered[selCity].city}</div>
            <div style={{display:"flex",gap:"6px",alignItems:"center",marginBottom:"12px"}}><RegionTag region={filtered[selCity].region}/><span style={{fontSize:"10px",color:"#64748b"}}>{filtered[selCity].state}</span></div>
            <div style={{fontSize:"11px",color:"#64748b",marginBottom:"8px"}}>Max / Min Temperature</div>
            <ResponsiveContainer width="100%" height={170}><AreaChart data={selData} margin={{top:5,right:5,left:-10,bottom:5}}><CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/><XAxis dataKey="day" tick={{fontSize:10,fill:"#94a3b8"}} tickLine={false}/><YAxis tick={{fontSize:10,fill:"#94a3b8"}} tickLine={false} unit="°"/><RTooltip contentStyle={{background:"#1a2744",border:"1px solid #2d4a6f",borderRadius:"6px",fontSize:"11px"}} itemStyle={{color:"#e2e8f0"}}/><Area type="monotone" dataKey="max" name="Max" stroke="#ef4444" fill="#ef444422" strokeWidth={2}/><Area type="monotone" dataKey="min" name="Min" stroke="#60a5fa" fill="#60a5fa22" strokeWidth={2}/></AreaChart></ResponsiveContainer>
            <div style={{fontSize:"11px",color:"#64748b",marginTop:"12px",marginBottom:"8px"}}>Rain Probability</div>
            <ResponsiveContainer width="100%" height={110}><BarChart data={selData} margin={{top:5,right:5,left:-10,bottom:5}}><CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/><XAxis dataKey="day" tick={{fontSize:10,fill:"#94a3b8"}} tickLine={false}/><YAxis tick={{fontSize:10,fill:"#94a3b8"}} tickLine={false} unit="%" domain={[0,100]}/><RTooltip contentStyle={{background:"#1a2744",border:"1px solid #2d4a6f",borderRadius:"6px",fontSize:"11px"}} itemStyle={{color:"#e2e8f0"}}/><Bar dataKey="rain" name="Rain %" radius={[3,3,0,0]}>{selData.map((d,i)=>(<Cell key={i} fill={rainColor(d.rain)}/>))}</Bar></BarChart></ResponsiveContainer>
          </div>):(<div style={{background:"#111827",border:"1px solid #1e293b",borderRadius:"8px",padding:"32px 20px",textAlign:"center"}}><div style={{fontSize:"28px",marginBottom:"8px"}}>📊</div><p style={{color:"#64748b",fontSize:"12px"}}>Click any city row to see detailed forecast charts</p></div>)}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ───────────────────────────────────────────────────
export default function App(){
  const[data,setData]=useState([]);const[loading,setLoading]=useState(false);const[progress,setProgress]=useState({current:0,total:0,phase:""});
  const[error,setError]=useState(null);const[tab,setTab]=useState("map");const[sortKey,setSortKey]=useState("deviation_max");const[sortDir,setSortDir]=useState("desc");
  const[stateFilter,setStateFilter]=useState("ALL");const[regionFilter,setRegionFilter]=useState("ALL");const[searchTerm,setSearchTerm]=useState("");
  const[fetched,setFetched]=useState(false);const[fetchTime,setFetchTime]=useState("");const[forecastDates,setForecastDates]=useState([]);

  const states=useMemo(()=>["ALL",...[...new Set(INDIAN_CITIES.map(c=>c.s))].sort()],[]);
  const regionsList=["ALL","North","South","East","West","Central","Northeast","Islands"];

  const fetchAll=useCallback(async()=>{
    setLoading(true);setError(null);setData([]);setFetched(false);
    const yd=new Date();yd.setDate(yd.getDate()-1);const ds=fmtD(yd);
    const hds=[1,2,3].map(y=>{const d=new Date(yd);d.setFullYear(d.getFullYear()-y);return fmtD(d);});
    const nb=Math.ceil(INDIAN_CITIES.length/BATCH);const tot=nb*5;let ops=0;
    const R=INDIAN_CITIES.map(c=>({city:c.n,state:c.s,region:c.region,lat:c.lat,lon:c.lon,current_max:null,current_min:null,hist_max_avg:null,hist_min_avg:null,hist_years:[],deviation_max:null,deviation_min:null,forecast:null}));
    let fcDates=[];
    try{
      for(let b=0;b<nb;b++){
        const st=b*BATCH,batch=INDIAN_CITIES.slice(st,st+BATCH);
        setProgress({current:ops,total:tot,phase:`Forecast + current temps (batch ${b+1}/${nb})`});
        try{const fd=await fetchForecast(batch);fd.forEach((d,i)=>{if(d?.daily?.temperature_2m_max){if(d.daily.temperature_2m_max[0]!=null){R[st+i].current_max=d.daily.temperature_2m_max[0];R[st+i].current_min=d.daily.temperature_2m_min[0];}const fc=[];for(let day=1;day<=7;day++){if(d.daily.time[day]){fc.push({date:d.daily.time[day],max:d.daily.temperature_2m_max[day],min:d.daily.temperature_2m_min[day],rain:d.daily.precipitation_probability_max?.[day]??null});if(b===0&&i===0)fcDates.push(d.daily.time[day]);}}R[st+i].forecast=fc;}});}catch(e){console.warn("Forecast err:",e);}
        ops++;await new Promise(r=>setTimeout(r,200));
      }
      setForecastDates(fcDates);
      for(let b=0;b<nb;b++){
        const st=b*BATCH,batch=INDIAN_CITIES.slice(st,st+BATCH);
        setProgress({current:ops,total:tot,phase:`Yesterday's baseline (batch ${b+1}/${nb})`});
        if(!R[st].current_max){try{const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${batch.map(c=>c.lat).join(",")}&longitude=${batch.map(c=>c.lon).join(",")}&daily=temperature_2m_max,temperature_2m_min&start_date=${ds}&end_date=${ds}&timezone=Asia/Kolkata`);if(r.ok){const cd=await r.json();const arr=Array.isArray(cd)?cd:[cd];arr.forEach((d,i)=>{if(d?.daily?.temperature_2m_max?.[0]!=null&&!R[st+i].current_max){R[st+i].current_max=d.daily.temperature_2m_max[0];R[st+i].current_min=d.daily.temperature_2m_min[0];}});}}catch(e){}}
        ops++;
        for(let y=0;y<3;y++){
          setProgress({current:ops,total:tot,phase:`${yd.getFullYear()-y-1} historical (batch ${b+1}/${nb})`});
          try{const hd=await fetchHist(batch,hds[y]);hd.forEach((d,i)=>{if(d?.daily?.temperature_2m_max?.[0]!=null){if(!R[st+i].hist_years[y])R[st+i].hist_years[y]={};R[st+i].hist_years[y].max=d.daily.temperature_2m_max[0];R[st+i].hist_years[y].min=d.daily.temperature_2m_min[0];}});}catch(e){}
          ops++;await new Promise(r=>setTimeout(r,250));
        }
      }
      let ok=false;
      R.forEach(r=>{const vm=(r.hist_years||[]).filter(y=>y?.max!=null).map(y=>y.max),vn=(r.hist_years||[]).filter(y=>y?.min!=null).map(y=>y.min);if(vm.length)r.hist_max_avg=+(vm.reduce((a,b)=>a+b,0)/vm.length).toFixed(1);if(vn.length)r.hist_min_avg=+(vn.reduce((a,b)=>a+b,0)/vn.length).toFixed(1);if(r.current_max!=null&&r.hist_max_avg!=null)r.deviation_max=+(r.current_max-r.hist_max_avg).toFixed(1);if(r.current_min!=null&&r.hist_min_avg!=null)r.deviation_min=+(r.current_min-r.hist_min_avg).toFixed(1);if(r.current_max!=null||r.forecast)ok=true;});
      if(!ok){setError("API returned no data. Please host on your own server or Vercel.");setLoading(false);return;}
      setFetchTime(new Date().toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"medium",timeZone:"Asia/Kolkata"}));
      setData(R);setFetched(true);setLoading(false);
    }catch(e){setError(`Fetch failed: ${e.message}`);setLoading(false);}
  },[]);

  useEffect(()=>{fetchAll();},[]);

  const filteredTable=useMemo(()=>{
    let d=[...data];if(stateFilter!=="ALL")d=d.filter(r=>r.state===stateFilter);if(regionFilter!=="ALL")d=d.filter(r=>r.region===regionFilter);if(searchTerm)d=d.filter(r=>r.city.toLowerCase().includes(searchTerm.toLowerCase()));
    d.sort((a,b)=>{let va=a[sortKey],vb=b[sortKey];if(va==null)va=sortDir==="desc"?-Infinity:Infinity;if(vb==null)vb=sortDir==="desc"?-Infinity:Infinity;if(typeof va==="string")return sortDir==="asc"?va.localeCompare(vb):vb.localeCompare(va);return sortDir==="asc"?va-vb:vb-va;});return d;
  },[data,stateFilter,regionFilter,searchTerm,sortKey,sortDir]);

  const stats=useMemo(()=>{const v=data.filter(d=>d.deviation_max!=null&&d.current_max!=null);if(!v.length)return null;return{hottest:v.reduce((a,b)=>a.current_max>b.current_max?a:b),coldest:v.reduce((a,b)=>a.current_min<b.current_min?a:b),maxDev:v.reduce((a,b)=>Math.abs(a.deviation_max)>Math.abs(b.deviation_max)?a:b),aboveN:v.filter(d=>d.deviation_max>1.5).length,belowN:v.filter(d=>d.deviation_max<-1.5).length,total:v.length};},[data]);

  const downloadCSV=useCallback(()=>{
    if(!data.length)return;
    const fcH=forecastDates.map((_,i)=>[`Day${i+1}_Max`,`Day${i+1}_Min`,`Day${i+1}_Rain%`]).flat();
    const headers=["City","State","Region","Lat","Lon","Current_Max","Current_Min","3Y_Avg_Max","3Y_Avg_Min","Max_Dev","Min_Dev",...fcH];
    const rows=data.map(r=>{const base=[r.city,r.state,r.region,r.lat,r.lon,r.current_max??"",r.current_min??"",r.hist_max_avg??"",r.hist_min_avg??"",r.deviation_max??"",r.deviation_min??""];const fc=forecastDates.map((_,i)=>{const f=r.forecast?.[i];return[f?.max??"",f?.min??"",f?.rain??""];}).flat();return[...base,...fc].join(",");});
    const csv=[headers.join(","),...rows].join("\n");const blob=new Blob([csv],{type:"text/csv"});const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download=`india-temp-forecast-${new Date().toISOString().split("T")[0]}.csv`;a.click();URL.revokeObjectURL(url);
  },[data,forecastDates]);

  const handleSort=k=>{if(sortKey===k)setSortDir(d=>d==="asc"?"desc":"asc");else{setSortKey(k);setSortDir("desc");}};
  const SI=({col})=>sortKey!==col?<span style={{opacity:0.25,fontSize:"9px",marginLeft:"2px"}}>⇅</span>:<span style={{fontSize:"9px",marginLeft:"2px"}}>{sortDir==="asc"?"↑":"↓"}</span>;
  const pPct=progress.total?Math.round(progress.current/progress.total*100):0;
  const mono={fontFamily:"'JetBrains Mono',monospace"};

  return(
    <div style={{fontFamily:"'IBM Plex Sans',sans-serif",background:"#080c16",color:"#e2e8f0",minHeight:"100vh"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:#111827}::-webkit-scrollbar-thumb{background:#334155;border-radius:3px}.trow:hover td{background:#1a2744 !important}`}</style>

      <div style={{background:"linear-gradient(135deg,#0f172a,#1a1a2e)",borderBottom:"1px solid #1e3a5f",padding:"16px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"10px"}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}><span style={{fontSize:"20px"}}>🌡️</span><h1 style={{fontSize:"18px",fontWeight:700,background:"linear-gradient(90deg,#f97316,#ef4444)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>India Temperature Monitor — 200 Cities</h1></div>
          <p style={{fontSize:"11px",color:"#64748b",marginLeft:"30px",marginTop:"2px"}}>Live data + 7-day forecast from Open-Meteo API · Current vs 3-year historical · Region-wise{fetchTime&&<span> · Last fetched: <strong style={{color:"#94a3b8"}}>{fetchTime}</strong></span>}</p>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}><button onClick={()=>window.clerk?.signOut()} style={{background:"#1e293b",border:"1px solid #334155",borderRadius:"6px",padding:"6px 14px",color:"#94a3b8",fontSize:"11px",cursor:"pointer",fontFamily:"inherit"}}>Sign Out</button></div>
      </div>

      <div style={{padding:"20px 24px",maxWidth:"1500px",margin:"0 auto"}}>
        {loading&&(<div style={{textAlign:"center",padding:"48px 20px"}}><div style={{width:"100%",maxWidth:"500px",margin:"0 auto 16px",background:"#1e293b",borderRadius:"8px",height:"8px",overflow:"hidden"}}><div style={{width:`${pPct}%`,height:"100%",background:"linear-gradient(90deg,#f97316,#ef4444)",transition:"width 0.3s"}}/></div><p style={{color:"#e2e8f0",fontSize:"14px",fontWeight:500}}>{progress.phase}</p><p style={{color:"#64748b",fontSize:"12px",marginTop:"4px"}}>{pPct}% complete</p></div>)}
        {error&&(<div style={{background:"#451a0a",border:"1px solid #dc262655",borderRadius:"8px",padding:"14px 18px",margin:"16px 0"}}><p style={{color:"#fca5a5",fontSize:"13px",marginBottom:"8px"}}>{error}</p><button onClick={fetchAll} style={{background:"#dc262633",border:"1px solid #dc262666",color:"#fca5a5",padding:"6px 16px",borderRadius:"6px",fontSize:"12px",cursor:"pointer",fontFamily:"inherit"}}>Retry</button></div>)}

        {stats&&(<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(185px,1fr))",gap:"10px",marginBottom:"16px"}}>{[{label:"Hottest",value:stats.hottest.city,sub:`${stats.hottest.current_max?.toFixed(1)}°C · ${stats.hottest.region}`,color:"#ef4444"},{label:"Coldest",value:stats.coldest.city,sub:`${stats.coldest.current_min?.toFixed(1)}°C · ${stats.coldest.region}`,color:"#3b82f6"},{label:"Max Deviation",value:stats.maxDev.city,sub:`${stats.maxDev.deviation_max>0?"+":""}${stats.maxDev.deviation_max?.toFixed(1)}°C · ${stats.maxDev.region}`,color:"#f97316"},{label:"Above Normal (>1.5°)",value:`${stats.aboveN} cities`,sub:`of ${stats.total}`,color:"#fbbf24"},{label:"Below Normal (<-1.5°)",value:`${stats.belowN} cities`,sub:`of ${stats.total}`,color:"#60a5fa"}].map((c,i)=>(<div key={i} style={{background:"#111827",border:"1px solid #1e293b",borderRadius:"8px",padding:"12px 14px",borderLeft:`3px solid ${c.color}`}}><div style={{fontSize:"10px",color:"#64748b",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"4px"}}>{c.label}</div><div style={{fontSize:"14px",fontWeight:700,color:c.color}}>{c.value}</div><div style={{fontSize:"11px",color:"#94a3b8",marginTop:"1px"}}>{c.sub}</div></div>))}</div>)}

        {fetched&&(<>
          <div style={{display:"flex",gap:"0",marginBottom:"14px",borderBottom:"2px solid #1e293b"}}>
            {[["map","🗺️ Map"],["table","📊 Table"],["forecast","📈 Forecast"]].map(([k,l])=>(<button key={k} onClick={()=>setTab(k)} style={{background:"none",border:"none",padding:"10px 20px",fontSize:"13px",fontWeight:600,cursor:"pointer",fontFamily:"inherit",color:tab===k?"#f97316":"#64748b",borderBottom:tab===k?"2px solid #f97316":"2px solid transparent",marginBottom:"-2px"}}>{l}</button>))}
            <div style={{marginLeft:"auto",display:"flex",gap:"8px",alignItems:"center",paddingBottom:"6px"}}>
              <input type="text" placeholder="Search city..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} style={{background:"#111827",border:"1px solid #1e293b",borderRadius:"6px",padding:"6px 10px",color:"#e2e8f0",fontSize:"12px",fontFamily:"inherit",width:"150px",outline:"none"}}/>
              <select value={regionFilter} onChange={e=>setRegionFilter(e.target.value)} style={{background:"#111827",border:"1px solid #1e293b",borderRadius:"6px",padding:"6px 10px",color:"#e2e8f0",fontSize:"12px",fontFamily:"inherit",outline:"none"}}>{regionsList.map(r=><option key={r} value={r}>{r==="ALL"?"All Regions":r}</option>)}</select>
              <select value={stateFilter} onChange={e=>setStateFilter(e.target.value)} style={{background:"#111827",border:"1px solid #1e293b",borderRadius:"6px",padding:"6px 10px",color:"#e2e8f0",fontSize:"12px",fontFamily:"inherit",outline:"none"}}>{states.map(s=><option key={s} value={s}>{s==="ALL"?"All States":s}</option>)}</select>
              <button onClick={fetchAll} style={{background:"#1e293b",border:"1px solid #334155",borderRadius:"6px",padding:"6px 12px",color:"#94a3b8",fontSize:"11px",cursor:"pointer",fontFamily:"inherit"}}>🔄 Refresh</button>
              <button onClick={downloadCSV} style={{background:"#1e293b",border:"1px solid #10b981",borderRadius:"6px",padding:"6px 12px",color:"#10b981",fontSize:"11px",cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>⬇ CSV</button>
            </div>
          </div>

          {tab==="map"&&<IndiaMap data={data} regionFilter={regionFilter} searchTerm={searchTerm}/>}
          {tab==="forecast"&&<ForecastView data={data} regionFilter={regionFilter} searchTerm={searchTerm} forecastDates={forecastDates}/>}
          {tab==="table"&&(<>
            <div style={{display:"flex",gap:"14px",marginBottom:"10px",flexWrap:"wrap",alignItems:"center"}}>
              <span style={{fontSize:"10px",color:"#64748b"}}>Deviation:</span>
              {[{l:"> +3°",bg:"#dc2626"},{l:"+1.5~+3°",bg:"#ea580c"},{l:"0~+1.5°",bg:"#ca8a04"},{l:"0~-1.5°",bg:"#60a5fa"},{l:"-1.5~-3°",bg:"#2563eb"},{l:"< -3°",bg:"#1d4ed8"}].map((x,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:"3px"}}><span style={{width:"10px",height:"10px",borderRadius:"2px",background:x.bg,display:"inline-block"}}/><span style={{fontSize:"9px",color:"#94a3b8"}}>{x.l}</span></div>))}
              <span style={{fontSize:"11px",color:"#64748b",marginLeft:"auto"}}>{filteredTable.length} of {data.length} cities</span>
            </div>
            <div style={{overflowX:"auto",borderRadius:"8px",border:"1px solid #1e293b"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:"12px"}}>
                <thead><tr style={{background:"#0f1729"}}>
                  {[{k:"city",l:"City"},{k:"state",l:"State"},{k:"region",l:"Region"},{k:"current_max",l:"Max °C"},{k:"current_min",l:"Min °C"},{k:"hist_max_avg",l:"3Y Avg Max"},{k:"hist_min_avg",l:"3Y Avg Min"},{k:"deviation_max",l:"Max Dev"},{k:"deviation_min",l:"Min Dev"}].map(c=>(<th key={c.k} onClick={()=>handleSort(c.k)} style={{padding:"9px 8px",textAlign:"left",cursor:"pointer",color:sortKey===c.k?"#f97316":"#94a3b8",fontSize:"10px",textTransform:"uppercase",letterSpacing:"0.4px",fontWeight:600,borderBottom:"2px solid #1e3a5f",whiteSpace:"nowrap",userSelect:"none"}}>{c.l}<SI col={c.k}/></th>))}
                  {forecastDates.slice(0,3).map((ds,i)=>(<th key={`fc${i}`} style={{padding:"9px 4px",textAlign:"center",color:"#94a3b8",fontSize:"9px",borderBottom:"2px solid #1e3a5f",whiteSpace:"nowrap"}}><div style={{color:"#f97316",fontSize:"9px"}}>FC</div>{weekday(ds)}<br/>{shortDay(ds)}</th>))}
                </tr></thead>
                <tbody>{filteredTable.map((row,i)=>{const bg=i%2===0?"#080c16":"#0c1120";return(<tr key={`${row.city}-${row.state}-${i}`} className="trow">
                  <td style={{padding:"6px 8px",fontWeight:500,background:bg}}>{row.city}</td>
                  <td style={{padding:"6px 8px",...mono,fontSize:"10px",color:"#64748b",background:bg}}>{row.state}</td>
                  <td style={{padding:"6px 8px",background:bg}}><RegionTag region={row.region}/></td>
                  <td style={{padding:"6px 8px",...mono,fontWeight:600,background:bg,color:row.current_max>40?"#ef4444":row.current_max>35?"#f97316":"#e2e8f0"}}>{row.current_max?.toFixed(1)??"—"}</td>
                  <td style={{padding:"6px 8px",...mono,background:bg,color:row.current_min<10?"#60a5fa":"#cbd5e1"}}>{row.current_min?.toFixed(1)??"—"}</td>
                  <td style={{padding:"6px 8px",...mono,color:"#94a3b8",fontSize:"11px",background:bg}}>{row.hist_max_avg?.toFixed(1)??"—"}</td>
                  <td style={{padding:"6px 8px",...mono,color:"#94a3b8",fontSize:"11px",background:bg}}>{row.hist_min_avg?.toFixed(1)??"—"}</td>
                  <td style={{padding:"6px 8px",background:bg}}><DevBadge value={row.deviation_max}/></td>
                  <td style={{padding:"6px 8px",background:bg}}><DevBadge value={row.deviation_min}/></td>
                  {forecastDates.slice(0,3).map((ds,fi)=>{const f=row.forecast?.[fi];return(<td key={fi} style={{padding:"4px 6px",textAlign:"center",background:bg}}>{f?(<><div style={{...mono,fontSize:"11px",fontWeight:600,color:f.max>40?"#ef4444":f.max>35?"#f97316":"#e2e8f0"}}>{f.max?.toFixed(0)}°/{f.min?.toFixed(0)}°</div>{f.rain>20&&<div style={{fontSize:"8px",color:rainColor(f.rain)}}>🌧{f.rain}%</div>}</>):"—"}</td>);})}
                </tr>);})}</tbody>
              </table>
            </div>
          </>)}

          <div style={{marginTop:"14px",padding:"10px 14px",background:"#111827",borderRadius:"8px",border:"1px solid #1e293b"}}><p style={{fontSize:"10px",color:"#64748b"}}><strong style={{color:"#94a3b8"}}>Source:</strong> Open-Meteo.com (free) · <strong style={{color:"#94a3b8"}}>Current:</strong> Today's max/min · <strong style={{color:"#94a3b8"}}>Historical:</strong> Same date past 3 years · <strong style={{color:"#94a3b8"}}>Forecast:</strong> 7-day ahead (max, min, rain probability) · <strong style={{color:"#94a3b8"}}>Regions:</strong> North · South · East · West · Central · Northeast · Islands</p></div>
        </>)}
      </div>
    </div>
  );
}
