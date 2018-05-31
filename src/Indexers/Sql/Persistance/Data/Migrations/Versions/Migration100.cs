using System;
using System.Collections.Generic;
using System.Data;
using Terratype.Indexer;
using Terratype.Indexers.Sql.Persistance.Context;
using Umbraco.Core;
using Umbraco.Core.Logging;
using Umbraco.Core.Persistence;
using Umbraco.Core.Persistence.Migrations;
using Umbraco.Core.Persistence.SqlSyntax;

namespace Terratype.Indexers.Sql.Persistance.Data.Migrations.Versions
{
    /// <summary>
    /// Handles Creating/Editing the Configuration table
    /// </summary>
    [Migration("1.0.0", 1, nameof(Terratype) + nameof(Indexer) + nameof(Sql))]
    internal class Migration100 : MigrationBase
	{
        private readonly UmbracoDatabase _database = ApplicationContext.Current.DatabaseContext.Database;
        private readonly DatabaseSchemaHelper _schemaHelper;

        public Migration100(ISqlSyntaxProvider sqlSyntax, ILogger logger) : base(sqlSyntax, logger)
        {
            _schemaHelper = new DatabaseSchemaHelper(_database, logger, sqlSyntax);
        }
		
        public override void Up()
		{
			try
			{
				//	Create tables
				_schemaHelper.CreateTable<Dto.Entry.Entry100>();
				_schemaHelper.CreateTable<Dto.Ancestor.Ancestor100>();

				//	Scrape all existing content and place into the index
				var ancestorDb = new AncestorContext();
				var entryDb = new EntryContext();
				var now = DateTime.UtcNow;
				var contents = new Stack<Umbraco.Core.Models.IContent>();
				var contentService = ApplicationContext.Current.Services.ContentService;

				foreach (var content in contentService.GetChildren(Umbraco.Core.Constants.System.Root))
				{
					if (content.Published)
					{
						contents.Push(content);
					}
				}

				while (contents.Count != 0)
				{
					var content = contents.Pop();
					foreach (var child in contentService.GetChildren(content.Id))
					{
						if (child.Published)
						{
							contents.Push(child);
						}
					}
					foreach (var entry in new ContentService().Entries(new Umbraco.Core.Models.IContent[] { content } ))
					{
						entryDb.Write(entry.Key, entry.Id, entry.Map, now);
						ancestorDb.Write(entry.Id, entry.Key, now);
						foreach (var ancestor in entry.Ancestors)
						{
							ancestorDb.Write(ancestor, entry.Key, now);
						}
					}
					System.Threading.Thread.Sleep(50);
				}
			}
			catch (Exception ex)
			{
				LogHelper.Error<SqlIndexer>($"Error trying to create content with indexer", ex);
			}

		}

        public override void Down()
        {
			_schemaHelper.DropTable<Dto.Ancestor.Ancestor100>();
			_schemaHelper.DropTable<Dto.Entry.Entry100>();
		}

	}
}
