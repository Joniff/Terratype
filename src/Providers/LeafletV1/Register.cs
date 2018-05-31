using Umbraco.Core;

namespace Terratype.Providers.LeafletV1Core
{
	public class Register : ApplicationEventHandler
    {
        protected override void ApplicationStarting(UmbracoApplicationBase umbracoApplication, ApplicationContext applicationContext)
        {
			base.ApplicationStarting(umbracoApplication, applicationContext);
			Models.Provider.RegisterType<Models.Provider, Providers.LeafletV1>(Providers.LeafletV1._Id);
        }
	}
}
