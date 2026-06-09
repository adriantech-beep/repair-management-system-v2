using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace repair_management_api.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantIsolationToPartsAndDevices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Parts_PartNumber",
                table: "Parts");

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "Parts",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "Devices",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Parts_TenantId",
                table: "Parts",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Parts_TenantId_PartNumber",
                table: "Parts",
                columns: new[] { "TenantId", "PartNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Devices_TenantId",
                table: "Devices",
                column: "TenantId");

            migrationBuilder.AddForeignKey(
                name: "FK_Devices_Tenants_TenantId",
                table: "Devices",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Parts_Tenants_TenantId",
                table: "Parts",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Devices_Tenants_TenantId",
                table: "Devices");

            migrationBuilder.DropForeignKey(
                name: "FK_Parts_Tenants_TenantId",
                table: "Parts");

            migrationBuilder.DropIndex(
                name: "IX_Parts_TenantId",
                table: "Parts");

            migrationBuilder.DropIndex(
                name: "IX_Parts_TenantId_PartNumber",
                table: "Parts");

            migrationBuilder.DropIndex(
                name: "IX_Devices_TenantId",
                table: "Devices");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Parts");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Devices");

            migrationBuilder.CreateIndex(
                name: "IX_Parts_PartNumber",
                table: "Parts",
                column: "PartNumber",
                unique: true);
        }
    }
}
