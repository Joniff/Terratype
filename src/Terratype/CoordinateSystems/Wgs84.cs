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
            if (Datum is Models.LatLng)
            {
                return Datum as Models.LatLng;
            }
            throw new NotImplementedException();
        }

        public override void FromWgs84(Models.LatLng wgs84Position)
        {
            Datum = wgs84Position;
        }
    }
}
