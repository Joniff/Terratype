using Terratype.Models;
using Umbraco.Core;
using Umbraco.Core.Composing;

namespace Terratype.Providers.BingMapsV8Core
{
	[RuntimeLevel(MinLevel = RuntimeLevel.Run)]
	public class Register : IUserComposer
	{
		public void Compose(Composition composition)
		{
			var container = new LightInject.ServiceContainer();
			container.Register<Provider, BingMapsV8>(BingMapsV8._Id);
		}
	}
}
