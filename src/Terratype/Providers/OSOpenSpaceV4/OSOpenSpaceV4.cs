using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Terratype.Providers.OSOpenSpaceV4
{
    public class OSOpenSpaceV4 : ProviderBase
    {
        public override string Id
        {
            get
            {
                return "OSOpenSpaceV4";
            }
        }

        public override string Name
        {
            get
            {
                return "OS OpenSpace V4 (UK only)";
            }
        }

        public override string Description
        {
            get
            {
                return "Grid based Ordnance Survey system that only works in the UK";
            }
        }


        public override string ReferenceUrl
        {
            get
            {
                return "https://www.ordnancesurvey.co.uk/innovate/innovate-with-open-space.html";
            }
        }
        public override IDictionary<string, Type> CoordinateSystems
        {
            get
            {
                var osdb36 = new CoordinateSystems.Osgb36();

                return new Dictionary<string, Type>
                {
                    { osdb36.Id, osdb36.GetType() }
                };
            }
        }

    }
}
