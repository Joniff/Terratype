using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Terratype.Providers
{
    public class BingMapsV8 : ProviderBase
    {
        public override string Id
        {
            get
            {
                return "BingMapsV8";
            }
        }
        public override string Name
        {
            get
            {
                return "Bing Maps V8";
            }
        }

        public override string Description
        {
            get
            {
                return "Mapping system delivered by Microsoft. Requires an API key with entry level costs of 100K tranactions per month for $4,500";
            }
        }

        public override string ReferenceUrl
        {
            get
            {
                return "https://www.microsoft.com/maps/choose-your-bing-maps-API.aspx";
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
