using Newtonsoft.Json;
using System;

namespace Terratype.CoordinateSystems
{
    ///  https://en.wikipedia.org/wiki/Restrictions_on_geographic_data_in_China#GCJ-02

    [JsonObject(MemberSerialization.OptIn)]
    public class Gcj02 : Position
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
                return "GCJ-02 (China only)";
            }
        }

        public override string Description
        {
            get
            {
                return "Under Chinese state law regarding restrictions on geographic data, you must use GCJ-02 encoded coordinates in China or for displaying Chinese coordinates correctly. Display format is Latitude,Longitude";
            }
        }

        public override string ReferenceUrl
        {
            get
            {
                return "https://en.wikipedia.org/wiki/Restrictions_on_geographic_data_in_China#GCJ-02";
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
