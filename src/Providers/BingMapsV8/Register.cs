using Umbraco.Core;
using Umbraco.Core.Composing;

namespace Terratype.Providers.BingMapsV8Core
{
	[RuntimeLevel(MinLevel = RuntimeLevel.Run)]
	public class Register : IUserComposer
	{
		public void Compose(Composition composition)
		{
			composition.Register<IProvider, BingMapsV8>();
		}
	}
}
