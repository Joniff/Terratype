using Newtonsoft.Json;
using System.Diagnostics;

namespace Terratype.Models
{
    [DebuggerDisplay("{Latitude},{Longitude}")]
    [JsonObject(MemberSerialization.OptIn, ItemTypeNameHandling = TypeNameHandling.All)]
    public class LatLng
    {
        /// Latitude of map position in WGS 84 system
        [JsonProperty(PropertyName = "latitude")]
        public double Latitude { get; set; }

        /// <summary>
        /// Longitude of map position in WGS 84 system
        /// </summary>
        [JsonProperty(PropertyName = "longitude")]
        public double Longitude { get; set; }
    }
}
