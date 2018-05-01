using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Core.Persistence;
using Umbraco.Core.Persistence.DatabaseAnnotations;

namespace Terratype.Indexer.Sql.Persistance.Data.Migrations.Dto.Ancestor
{
    [TableName(nameof(Terratype) + nameof(Indexer) + nameof(Sql) + nameof(Dto.Ancestor))]
    [PrimaryKey(nameof(Ancestor100.Identifier), autoIncrement = true)]

	internal class Ancestor100
	{
        [PrimaryKeyColumn(AutoIncrement = true)]
        [NullSetting(NullSetting = NullSettings.NotNull)]
        public int Identifier { get; set; }

        [NullSetting(NullSetting = NullSettings.NotNull)]
        //[ForeignKey(typeof(UmbracoNode.UmbracoNode100), Column = "uniqueID", Name = "FK_" + nameof(Terratype) + nameof(Indexer) + nameof(Sql) + nameof(Dto.Ancestor) + nameof(UmbracoNode))]
        [Index(IndexTypes.NonClustered, Name = "IX_" + nameof(Terratype) + nameof(Indexer) + nameof(Sql) + nameof(Dto.Ancestor) + nameof(UmbracoNode))]
		public Guid UmbracoNode { get; set; }

        [NullSetting(NullSetting = NullSettings.NotNull)]
        [ForeignKey(typeof(Entry.Entry100), Column = nameof(Dto.Entry.Entry100.Identifier), Name = "FK_" + nameof(Terratype) + nameof(Indexer) + nameof(Sql) + nameof(Dto.Ancestor) + nameof(Dto.Entry))]
        [Index(IndexTypes.NonClustered, Name = "IX_" + nameof(Terratype) + nameof(Indexer) + nameof(Sql) + nameof(Dto.Ancestor) + nameof(Dto.Entry))]
		[Length(4000)]
        public string Entry { get; set; }

        [NullSetting(NullSetting = NullSettings.NotNull)]
        [Index(IndexTypes.NonClustered, Name = "IX_" + nameof(Terratype) + nameof(Indexer) + nameof(Sql) + nameof(Dto.Ancestor) + nameof(LastModified))]
		public DateTime LastModified { get; set; }
	}
}
