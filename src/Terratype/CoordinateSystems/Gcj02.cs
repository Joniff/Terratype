using Newtonsoft.Json;
using System;

namespace Terratype.CoordinateSystems
{
    ///  https://en.wikipedia.org/wiki/Restrictions_on_geographic_data_in_China#GCJ-02

    [JsonObject(MemberSerialization.OptIn)]
    public class Gcj02 : Models.Position
    {
        [JsonProperty]
        public override string Id
        {
            get
            {
                return "GCJ02";
            }
        }

        public override string Name
        {
            get
            {
                return "terratypeGcj02_name";
            }
        }

        public override string Description
        {
            get
            {
                return "terratypeGcj02_description";
            }
        }

        public override string ReferenceUrl
        {
            get
            {
                return "terratypeGcj02_referenceUrl";
            }
        }

        public override Models.LatLng ToWgs84()
        {
            throw new NotImplementedException(); 

        }

        public override void FromWgs84(Models.LatLng wgs84Position)
        {
            throw new NotImplementedException();
        }
    }
}
