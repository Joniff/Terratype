using Terratype.Models;
using Umbraco.Core;
using Umbraco.Core.Composing;

namespace Terratype.Providers.LeafletV1Core
{
	[RuntimeLevel(MinLevel = RuntimeLevel.Run)]
	public class Register : IUserComposer
	{
		public void Compose(Composition composition)
		{
			var container = new LightInject.ServiceContainer();
			container.Register<Provider, LeafletV1>(LeafletV1._Id);
		}
	}
}
