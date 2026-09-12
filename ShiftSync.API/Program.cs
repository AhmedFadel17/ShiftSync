
using System;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using ShiftSync.API.Data;
using ShiftSync.API.Repositories;
using ShiftSync.API.Repositories.Shifts;
using ShiftSync.API.Services.Shifts;
using ShiftSync.API.Validators.Shifts;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
    options.ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning));
});




// Add services to the container.
builder.Services.AddAutoMapper(cfg => { }, AppDomain.CurrentDomain.GetAssemblies());
builder.Services.AddValidatorsFromAssemblyContaining<CreateShiftValidator>();

builder.Services.AddScoped<IShiftService, ShiftService>();
// Generic Repository
builder.Services.AddScoped(typeof(IBaseRepository<>), typeof(BaseRepository<>));
builder.Services.AddScoped<IShiftRepository, ShiftRepository>();

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
