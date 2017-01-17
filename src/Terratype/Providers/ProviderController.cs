using System.Collections.Generic;
using System.Linq;

namespace Terratype.Providers
{
    [Umbraco.Web.Mvc.PluginController("terratype")]
    public class ProviderController : Umbraco.Web.Editors.UmbracoAuthorizedJsonController
    {
        public class CoordinateSystemsJson
        {
            public string id { get; set; }
            public string name { get; set; }
            public string description { get; set; }

            public string referenceUrl { get; set; }

            public CoordinateSystemsJson(CoordinateSystems.Position position)
            {
                id = position.Id;
                name = position.Name;
                description = position.Description;
                referenceUrl = position.ReferenceUrl;
            }
        }


        public class ProviderJson
        {
            public string id { get; set; }
            public string name { get; set; }
            public string description { get; set; }
            public string referenceUrl { get; set; }
            public IEnumerable<CoordinateSystemsJson> coordinateSystems { get; set; }
            public bool canSearch { get; set; }

            public ProviderJson(ProviderBase provider)
            {
                id = provider.Id;
                name = provider.Name;
                description = provider.Description;
                referenceUrl = provider.ReferenceUrl;
                coordinateSystems = provider.CoordinateSystems.Select(x => new CoordinateSystemsJson(CoordinateSystems.Position.Create(x.Key)));
                canSearch = provider.CanSearch;
            }
        }

        [System.Web.Http.HttpGet]
        public IEnumerable<ProviderJson> Providers()
        {
            var providers = new List<ProviderJson>();
            foreach (var item in ProviderBase.Providers)
            {
                providers.Add(new ProviderJson(ProviderBase.Create(item.Value)));
            }
            return providers;
        }

        [System.Web.Http.HttpGet]
        public string Parse(string coordinateSystemId, string datum)
        {
            var position = CoordinateSystems.Position.Create(coordinateSystemId);
            if (position == null || !position.TryParse(datum))
            {
                return null;
            }
            return position.Datum.ToString();
        }
    }
}
