using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace repair_management_api.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantLogoUrl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LogoUrl",
                table: "Tenants",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LogoUrl",
                table: "Tenants");
        }
    }
}
