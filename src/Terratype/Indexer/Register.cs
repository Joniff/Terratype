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
				Umbraco.Core.Services.ContentService.Deleted += ContentService_Deleted;
				Umbraco.Core.Services.ContentService.Moved += ContentService_Moved;
			}
		}

		private void Sync(IEnumerable<Guid> remove, IEnumerable<Umbraco.Core.Models.IContent> add)
		{
			IEnumerable<Entry> entries = null;
			if (add != null && add.Any())
			{
				entries = new ContentService().Entries(add);
			}

			if (remove.Any() || (entries != null && entries.Any()))
			{
				foreach (var indexer in indexers)
				{
					indexer.Sync(remove, entries);
				}
			}
		}

		private void ContentService_Published(Umbraco.Core.Publishing.IPublishingStrategy sender, Umbraco.Core.Events.PublishEventArgs<Umbraco.Core.Models.IContent> contents)
		{
			Sync(contents.PublishedEntities.Select(x => x.Key), contents.PublishedEntities);
		}

		private void ContentService_UnPublished(Umbraco.Core.Publishing.IPublishingStrategy sender, Umbraco.Core.Events.PublishEventArgs<Umbraco.Core.Models.IContent> contents)
		{
			Sync(contents.PublishedEntities.Select(x => x.Key), null);
		}

		private void ContentService_Deleted(Umbraco.Core.Services.IContentService sender, Umbraco.Core.Events.DeleteEventArgs<Umbraco.Core.Models.IContent> e)
		{
			Sync(e.DeletedEntities.Select(x => x.Key), null);
		}

		private void ContentService_Moved(Umbraco.Core.Services.IContentService sender, Umbraco.Core.Events.MoveEventArgs<Umbraco.Core.Models.IContent> e)
		{
			Sync(e.MoveInfoCollection.Select(x => x.Entity.Key), e.MoveInfoCollection.Where(x => x.Entity.Published).Select(x => x.Entity));
		}
	}
}
