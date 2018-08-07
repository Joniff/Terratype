using Umbraco.Core;

namespace Terratype.Providers.BingMapsV8Core
{
	public class Register : ApplicationEventHandler
    {
        protected override void ApplicationStarting(UmbracoApplicationBase umbracoApplication, ApplicationContext applicationContext)
        {
			base.ApplicationStarting(umbracoApplication, applicationContext);
			Models.Provider.RegisterType<Models.Provider, Providers.BingMapsV8>(Providers.BingMapsV8._Id);
        }
	}
}
