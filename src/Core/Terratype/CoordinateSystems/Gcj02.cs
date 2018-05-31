using Newtonsoft.Json;
using System;
using System.Globalization;

namespace Terratype.CoordinateSystems
{
    ///  https://en.wikipedia.org/wiki/Restrictions_on_geographic_data_in_China#GCJ-02

    [JsonObject(MemberSerialization.OptIn)]
    public class Gcj02 : Models.Position
    {
		public const string _Id = "GCJ02";

        [JsonProperty(PropertyName = "id")]
        public override string Id => _Id;
        public override string Name => "terratypeGcj02_name";
        public override string Description => "terratypeGcj02_description";
        public override string ReferenceUrl => "terratypeGcj02_referenceUrl";

        private double transformLat(double x, double y)
        {
            var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.Sqrt(Math.Abs(x));
            ret += (20.0 * Math.Sin(6.0 * x * Math.PI) + 20.0 * Math.Sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
            ret += (20.0 * Math.Sin(y * Math.PI) + 40.0 * Math.Sin(y / 3.0 * Math.PI)) * 2.0 / 3.0;
            ret += (160.0 * Math.Sin(y / 12.0 * Math.PI) + 320 * Math.Sin(y * Math.PI / 30.0)) * 2.0 / 3.0;
            return ret;
        }
        private double transformLon(double x, double y)
        {
            var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.Sqrt(Math.Abs(x));
            ret += (20.0 * Math.Sin(6.0 * x * Math.PI) + 20.0 * Math.Sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
            ret += (20.0 * Math.Sin(x * Math.PI) + 40.0 * Math.Sin(x / 3.0 * Math.PI)) * 2.0 / 3.0;
            ret += (150.0 * Math.Sin(x / 12.0 * Math.PI) + 300.0 * Math.Sin(x / 30.0 * Math.PI)) * 2.0 / 3.0;
            return ret;
        }

        private Models.LatLng delta(double lat, double lon)
        {
            var a = 6378245.0; //  a: 卫星椭球坐标投影到平面地图坐标系的投影因子。  
            var ee = 0.00669342162296594323; //  ee: 椭球的偏心率。  
            var dLat = this.transformLat(lon - 105.0, lat - 35.0);
            var dLon = this.transformLon(lon - 105.0, lat - 35.0);
            var radLat = lat / 180.0 * Math.PI;
            var magic = Math.Sin(radLat);
            magic = 1 - ee * magic * magic;
            var sqrtMagic = Math.Sqrt(magic);
            dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * Math.PI);
            dLon = (dLon * 180.0) / (a / sqrtMagic * Math.Cos(radLat) * Math.PI);
            return new Models.LatLng()
            {
                Latitude = dLat,
                Longitude = dLon
            };
        }

        private bool outOfChina(double lat, double lon)
        {
            return (lon < 72.004 || lon > 137.8347 || lat < 0.8293 || lat > 55.8271);
        }

        private Models.LatLng gcj_encrypt(double wgsLat, double wgsLon)
        {
            if (outOfChina(wgsLat, wgsLon))
            {
                return new Models.LatLng()
                {
                    Latitude = wgsLat,
                    Longitude = wgsLon
                };
            }

            var d = delta(wgsLat, wgsLon);
            return new Models.LatLng()
            {
                Latitude = wgsLat + d.Latitude,
                Longitude = wgsLon + d.Longitude
            };
        }

        public override Models.LatLng ToWgs84()
        {
            DatumType datum = Datum;
            var initDelta = 0.01;
            var threshold = 0.000000001;
            var dLat = initDelta;
            var dLon = initDelta;
            var mLat = datum.Latitude - dLat;
            var mLon = datum.Longitude - dLon;
            var pLat = datum.Latitude + dLat;
            var pLon = datum.Longitude + dLon;
            double wgsLat = 0.0, wgsLon = 0.0;
            for (var i = 0; i != 10000; i++)
            {
                wgsLat = (mLat + pLat) / 2.0;
                wgsLon = (mLon + pLon) / 2.0;
                var tmp = gcj_encrypt(wgsLat, wgsLon);
                dLat = tmp.Latitude - datum.Latitude;
                dLon = tmp.Longitude - datum.Longitude;
                if ((Math.Abs(dLat) < threshold) && (Math.Abs(dLon) < threshold))
                    break;

                if (dLat > 0.0)
                    pLat = wgsLat;
                else
                    mLat = wgsLat;
                if (dLon > 0.0)
                    pLon = wgsLon;
                else
                    mLon = wgsLon;
            }
            return new Models.LatLng()
            {
                Latitude = wgsLat,
                Longitude = wgsLon
            };
        }

        public override void FromWgs84(Models.LatLng wgs84Position)
        {
            if (outOfChina(wgs84Position.Latitude, wgs84Position.Longitude))
            {
                _inheritedDatum = Math.Round(wgs84Position.Latitude, Precision).ToString(CultureInfo.InvariantCulture) + "," +
                    Math.Round(wgs84Position.Longitude, Precision).ToString(CultureInfo.InvariantCulture);
                return;
            }

            var d = delta(wgs84Position.Latitude, wgs84Position.Longitude);
            _inheritedDatum = Math.Round(wgs84Position.Latitude + d.Latitude, Precision).ToString(CultureInfo.InvariantCulture) + "," +
                Math.Round(wgs84Position.Longitude + d.Longitude, Precision).ToString(CultureInfo.InvariantCulture);
        }

        public Gcj02()
        {
        }

        public Gcj02(string initialPosition)
        {
            Parse(initialPosition);
        }

        public Gcj02(Models.LatLng wgs84Position)
        {
            FromWgs84(wgs84Position);
        }

        /// <summary>
        /// Holds the current values for this class, this for when you want GCJ-02 position for use on a map or in further calulations, but not for conversion to other coordinate systems
        /// </summary>
        public class DatumType
        {
            public double Latitude;
            public double Longitude;
        }

        public DatumType Datum
        {
            get
            {
                if (_inheritedDatum is DatumType)
                {
                    return _inheritedDatum as DatumType;
                }
                else if (_inheritedDatum is string)
                {
                    var d = _inheritedDatum as string;
                    if (String.IsNullOrWhiteSpace(d))
                    {
                        return null;
                    }
                    var args = d.Split(',');
                    double lat = 0.0, lng = 0.0;
                    if (args.Length != 2 ||
                        !double.TryParse(args[0], NumberStyles.Any, CultureInfo.InvariantCulture, out lat) ||
                        !double.TryParse(args[1], NumberStyles.Any, CultureInfo.InvariantCulture, out lng))
                    {
                        return null;
                    }
                    return new DatumType()
                    {
                        Latitude = lat,
                        Longitude = lng
                    };
                }
                else
                {
                    throw new NotImplementedException();
                }
            }
            set
            {
                _inheritedDatum = Math.Round(value.Latitude, Precision).ToString(CultureInfo.InvariantCulture) + "," +
                    Math.Round(value.Longitude, Precision).ToString(CultureInfo.InvariantCulture);
            }
        }
        public Gcj02(DatumType datum)
        {
            Datum = datum;
        }

        /// <summary>
        /// Is the position currently specified within China. This is a very rough test
        /// </summary>
        public bool IsChina
        {
            get
            {
                var wgs84 = ToWgs84();
                return !outOfChina(wgs84.Latitude, wgs84.Longitude);
            }
        }

    }
}
