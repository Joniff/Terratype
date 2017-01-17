using Newtonsoft.Json;
using System;

namespace Terratype.CoordinateSystems
{
    //  https://en.wikipedia.org/wiki/Restrictions_on_geographic_data_in_China#BD-09

    [JsonObject(MemberSerialization.OptIn)]
    public class Bd09 : Position
    {
        [JsonProperty]
        public override string Id
        {
            get
            {
                return "BD09";
            }
        }

        public override string Name
        {
            get
            {
                return "BD-09";
            }
        }

        public override string ReferenceUrl
        {
            get
            {
                return "https://en.wikipedia.org/wiki/Restrictions_on_geographic_data_in_China#BD-09";
            }
        }

        public override string Description
        {
            get
            {
                return "Variant of GCJ-02, as required by Chinese State Law. Display format is Latitude,Longitude";
            }
        }

        public override LatLng ToWgs84()
        {
            throw new NotImplementedException();

        }

        public override void FromWgs84(LatLng wgs84Position)
        {
            throw new NotImplementedException();
        }
    }
}
