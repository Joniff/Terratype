using Newtonsoft.Json;
using System;
using System.Globalization;

namespace Terratype.CoordinateSystems
{
    //  https://en.wikipedia.org/wiki/World_Geodetic_System#Longitudes_on_WGS_84
    [JsonObject(MemberSerialization.OptIn)]
    public class Wgs84 : Position
    {
        [JsonProperty]
        public override string Id
        {
            get
            {
                return "WGS84";
            }
        }

        public override string Name
        {
            get
            {
                return "WGS-84";
            }
        }

        public override string Description
        {
            get
            {
                return "Standard World Geodetic System as used by GPS system, and adopted worldwide except for China (see GCJ-02). Display format is Latitude,Longitude";
            }
        }

        public override string ReferenceUrl
        {
            get
            {
                return "https://en.wikipedia.org/wiki/World_Geodetic_System#Longitudes_on_WGS_84";
            }
        }

        public override LatLng ToWgs84()
        {
            if (Datum is LatLng)
            {
                return Datum as LatLng;
            }
            throw new NotImplementedException();
        }

        public override void FromWgs84(LatLng wgs84Position)
        {
            Datum = wgs84Position;
        }
    }
}
