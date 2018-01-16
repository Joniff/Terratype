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
		private IEnumerable<Index> indexers;

        protected override void ApplicationStarted(UmbracoApplicationBase umbracoApplication, ApplicationContext applicationContext)
        {
            base.ApplicationStarted(umbracoApplication, applicationContext);
			indexers = Index.Register.Select(x =>  System.Activator.CreateInstance(x.Value) as Index);
			if (indexers.Any())
			{
				Umbraco.Core.Services.ContentService.Published += ContentService_Published;
				Umbraco.Core.Services.ContentService.UnPublished += ContentService_UnPublished;
			}
		}

		private void ContentService_Published(Umbraco.Core.Publishing.IPublishingStrategy sender, Umbraco.Core.Events.PublishEventArgs<Umbraco.Core.Models.IContent> contents)
		{
			var entries = new ContentService().Entries(contents.PublishedEntities);

			if (entries.Any())
			{
				foreach (var indexer in indexers)
				{
					indexer.Add(entries);
				}
			}

			var results = Index.Search(new Terratype.Indexer.Searchers.AncestorSearchRequest());
		}

		private void ContentService_UnPublished(Umbraco.Core.Publishing.IPublishingStrategy sender, Umbraco.Core.Events.PublishEventArgs<Umbraco.Core.Models.IContent> contents)
		{
			var entries = new ContentService().Entries(contents.PublishedEntities);

			if (entries.Any())
			{
				foreach (var indexer in indexers)
				{
					indexer.Delete(entries);
				}
			}
		}
	}
}
