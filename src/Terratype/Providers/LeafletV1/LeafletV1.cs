using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Terratype.Providers
{
    public class LeafletV1 : ProviderBase
    {
        public override string Id
        {
            get
            {
                return "LeafletV1";
            }
        }

        public override string Name
        {
            get
            {
                return "Leaflet V1";
            }
        }

        public override string Description
        {
            get
            {
                return "Open source map library that allows various Map providers, including OpenStreetMap, via Leaflet plugins";
            }
        }

        public override string ReferenceUrl
        {
            get
            {
                return "http://leafletjs.com/index.html";
            }
        }
        public override IDictionary<string, Type> CoordinateSystems
        {
            get
            {
                var wgs84 = new CoordinateSystems.Wgs84();

                return new Dictionary<string, Type>
                {
                    { wgs84.Id, wgs84.GetType() }
                };
            }
        }

    }
}
