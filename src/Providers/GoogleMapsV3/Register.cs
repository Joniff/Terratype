using Terratype.Models;
using Umbraco.Core;
using Umbraco.Core.Composing;

namespace Terratype.Providers.GoogleMapsV3Core
{
	[RuntimeLevel(MinLevel = RuntimeLevel.Run)]
	public class Register : IUserComposer
	{
		public void Compose(Composition composition)
		{
			var container = new LightInject.ServiceContainer();
			container.Register<Provider, GoogleMapsV3>(GoogleMapsV3._Id);
		}
	}
}
