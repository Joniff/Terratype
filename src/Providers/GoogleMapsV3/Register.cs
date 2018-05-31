using Umbraco.Core;

namespace Terratype.Providers.GoogleMapsV3Core
{
	public class Register : ApplicationEventHandler
    {
        protected override void ApplicationStarting(UmbracoApplicationBase umbracoApplication, ApplicationContext applicationContext)
        {
			base.ApplicationStarting(umbracoApplication, applicationContext);
			Models.Provider.RegisterType<Models.Provider, Providers.GoogleMapsV3>(Providers.GoogleMapsV3._Id);
        }
	}
}
