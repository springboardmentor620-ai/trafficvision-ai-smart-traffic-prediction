"""Build the searchable place gazetteer + per-place traffic aggregates from the dataset."""
import os, re, csv
import pandas as pd, numpy as np

CSV = os.environ.get("ROUTES_CSV", "/tmp/kag/bangalore_routes.csv")
OUT = "/tmp/places.csv"

cols = ["source_location","destination_location","lat_src","lon_src","lat_dest","lon_dest",
        "road_capacity","vehicles","speed","signal_time","distance","travel_time"]
df = pd.read_csv(CSV, usecols=cols)

a = df[["source_location","lat_src","lon_src","road_capacity","vehicles","speed","signal_time"]]
a.columns = ["name","lat","lng","capacity","vehicles","speed","signal"]
b = df[["destination_location","lat_dest","lon_dest","road_capacity","vehicles","speed","signal"]] if False else None
b = df[["destination_location","lat_dest","lon_dest","road_capacity","vehicles","speed","signal_time"]]
b.columns = ["name","lat","lng","capacity","vehicles","speed","signal"]
allp = pd.concat([a,b])
g = allp.groupby("name").agg(lat=("lat","median"), lng=("lng","median"),
                             capacity=("capacity","mean"), vehicles=("vehicles","mean"),
                             speed=("speed","mean"), signal=("signal","mean"),
                             samples=("lat","size")).reset_index()

RULES = [
 ("Metro station", r"metro"), ("Bus stop", r"bus stop|bus stand|bus station|bus terminal|depot"),
 ("Railway station", r"railway|junction station|\brail\b"), ("Airport", r"airport"),
 ("Temple", r"temple|mandir|matha|math\b|masjid|church|dargah"),
 ("Hospital", r"hospital|clinic|health|nursing home|medical"),
 ("College", r"college|university|institute|school|vidyalaya|campus"),
 ("Mall", r"mall|shopping|market|bazaar|commercial"),
 ("Park", r"park|lake|garden|playground|tank"),
 ("Hotel", r"hotel|resort|inn\b|lodge"),
 ("Restaurant", r"restaurant|cafe|bar\b|brewery|brewpub|darshini"),
 ("Office", r"tech park|it park|software|infosys|wipro|tcs|accenture|ibm|oracle|microsoft|google|amazon|intel|cisco|sap|dell|bosch|corporate|office|business park|sez"),
 ("Government", r"post office|bbmp|police|court|government|panchayat"),
 ("Junction", r"junction|circle|chowk|signal|flyover|underpass"),
 ("Road", r"\broad\b|\bmain\b|\bcross\b|\bgalli\b|\blane\b|\bstreet\b|\bmarg\b"),
]
def categorize(n):
    s = n.lower()
    for label, pat in RULES:
        if re.search(pat, s):
            return label
    return "Area"

AREAS = sorted({" ".join(n.split()[:2]) for n in g.name}, key=len)
def area_of(n):
    return " ".join(n.split()[:2])

g["category"] = g.name.map(categorize)
g["area"] = g.name.map(area_of)
g["search"] = (g.name + " " + g.category + " " + g.area).str.lower()
g = g.round({"lat":6,"lng":6,"capacity":0,"vehicles":1,"speed":2,"signal":1})
g.to_csv(OUT, index=False, columns=["name","area","category","lat","lng","capacity","vehicles","speed","signal","samples","search"], quoting=csv.QUOTE_MINIMAL)
print(len(g), g.category.value_counts().to_dict())
print("wrote", OUT, os.path.getsize(OUT)/1e6, "MB")
