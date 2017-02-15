using Newtonsoft.Json;
using System;
using System.Globalization;

namespace Terratype.CoordinateSystems
{
    //  https://en.wikipedia.org/wiki/World_Geodetic_System#Longitudes_on_WGS_84
    [JsonObject(MemberSerialization.OptIn)]
    public class Wgs84 : Models.Position
    {
        public static string _Id = "WGS84";

        [JsonProperty]
        public override string Id
        {
            get
            {
                return _Id;
            }
        }

        public override string Name
        {
            get
            {
                return "terratypeWgs84_name";
            }
        }

        public override string Description
        {
            get
            {
                return "terratypeWgs84_description";
            }
        }

        public override string ReferenceUrl
        {
            get
            {
                return "terratypeWgs84_referenceUrl";
            }
        }

        public override Models.LatLng ToWgs84()
        {
            if (_inheritedDatum is Models.LatLng)
            {
                return _inheritedDatum as Models.LatLng;
            }
            if (_inheritedDatum is string)
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
                return new Models.LatLng()
                {
                    Latitude = lat,
                    Longitude = lng
                };
            }

            throw new NotImplementedException();
        }

        public override void FromWgs84(Models.LatLng wgs84Position)
        {
            _inheritedDatum = Math.Round(wgs84Position.Latitude, Precision).ToString(CultureInfo.InvariantCulture) + "," +
                Math.Round(wgs84Position.Longitude, Precision).ToString(CultureInfo.InvariantCulture);
        }

        public Wgs84()
        {
        }

        public Wgs84(string initialPosition)
        {
            Parse(initialPosition);
        }

        public Wgs84(Models.LatLng wgs84Position)
        {
            FromWgs84(wgs84Position);
        }

        /// <summary>
        /// Holds the current values for this class, this for when you want WGS 84 position for use on a map or in further calulations, but not for conversion to other coordinate systems
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
                var wgs84 = ToWgs84();
                return new DatumType()
                {
                    Latitude = wgs84.Latitude,
                    Longitude = wgs84.Longitude
                };
            }
            set
            {
                FromWgs84(new Models.LatLng()
                {
                    Latitude = value.Latitude,
                    Longitude = value.Longitude
                });
            }
        }

        public Wgs84(DatumType datum)
        {
            Datum = datum;
        }

    }
}
