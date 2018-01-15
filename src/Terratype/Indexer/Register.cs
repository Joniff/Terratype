using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Core;

namespace Terratype.Indexer
{
	public class Register : ApplicationEventHandler
	{
		private IEnumerable<Terratype.Models.Indexer> indexers;

        protected override void ApplicationStarted(UmbracoApplicationBase umbracoApplication, ApplicationContext applicationContext)
        {
            base.ApplicationStarted(umbracoApplication, applicationContext);
			indexers = Terratype.Models.Indexer.Register.Select(x =>  System.Activator.CreateInstance(x.Value) as Terratype.Models.Indexer);
			if (indexers.Any())
			{
				Umbraco.Core.Services.ContentService.Published += ContentService_Published;
				Umbraco.Core.Services.ContentService.UnPublished += ContentService_UnPublished;
			}
		}

		private void ContentService_Published(Umbraco.Core.Publishing.IPublishingStrategy sender, Umbraco.Core.Events.PublishEventArgs<Umbraco.Core.Models.IContent> contents)
		{
			foreach (var indexer in indexers)
			{
				var service = new ContentService(indexer);
				foreach (var content in contents.PublishedEntities)
				{
					service.Save(content);
				}
			}
		}

		private void ContentService_UnPublished(Umbraco.Core.Publishing.IPublishingStrategy sender, Umbraco.Core.Events.PublishEventArgs<Umbraco.Core.Models.IContent> contents)
		{
			foreach (var indexer in indexers)
			{
				var service = new ContentService(indexer);
				foreach (var content in contents.PublishedEntities)
				{
					service.Delete(content);
				}
			}
		}
	}
}
