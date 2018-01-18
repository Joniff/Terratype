using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Core.Persistence;
using Umbraco.Core.Persistence.DatabaseAnnotations;

namespace Terratype.Indexer.Sql.Persistance.Data.Migrations.Dto.Entry
{
    [TableName(nameof(Terratype) + nameof(Indexer) + nameof(Sql) + nameof(Dto.Entry))]
    [PrimaryKey(nameof(Entry100.Identifier), autoIncrement = false)]
	internal class Entry100
	{
        [PrimaryKeyColumn(AutoIncrement = false)]
        [NullSetting(NullSetting = NullSettings.NotNull)]
		[Length(4000)]
        public string Identifier { get; set; }

        [NullSetting(NullSetting = NullSettings.NotNull)]
        //[ForeignKey(typeof(UmbracoNode.UmbracoNode100), Column = "uniqueID", Name = "FK_" + nameof(Terratype) + nameof(Indexer) + nameof(Sql) + nameof(Dto.Entry) + nameof(UmbracoNode))]
        [Index(IndexTypes.NonClustered, Name = "IX_" + nameof(Terratype) + nameof(Indexer) + nameof(Sql) + nameof(Dto.Entry) + nameof(UmbracoNode))]
		public Guid UmbracoNode { get; set; }

        [NullSetting(NullSetting = NullSettings.NotNull)]
		[Length(4000)]
		public string Map { get; set; }

        [NullSetting(NullSetting = NullSettings.NotNull)]
        [Index(IndexTypes.NonClustered, Name = "IX_" + nameof(Terratype) + nameof(Indexer) + nameof(Sql) + nameof(Dto.Entry) + nameof(Latitude))]
		public double Latitude { get; set; }

        [NullSetting(NullSetting = NullSettings.NotNull)]
        [Index(IndexTypes.NonClustered, Name = "IX_" + nameof(Terratype) + nameof(Indexer) + nameof(Sql) + nameof(Dto.Entry) + nameof(Longitude))]
		public double Longitude { get; set; }

        [NullSetting(NullSetting = NullSettings.NotNull)]
        [Index(IndexTypes.NonClustered, Name = "IX_" + nameof(Terratype) + nameof(Indexer) + nameof(Sql) + nameof(Dto.Entry) + nameof(LastModified))]
		public DateTime LastModified { get; set; }
	}
}
