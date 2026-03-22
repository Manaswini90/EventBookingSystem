using EventBooking.Data;
using EventBooking.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
public class BookingController : ControllerBase
{
    private readonly AppDbContext _context;

    public BookingController(AppDbContext context)
    {
        _context = context;
    }

    // 🔹 Book Event (User only)
    [HttpPost("create")]
    [Authorize(Roles = "User")]
    public IActionResult CreateBooking(Booking booking)
    {
        _context.Bookings.Add(booking);
        _context.SaveChanges();

        return Ok("Booking created");
    }

    // 🔹 View My Bookings
    [HttpGet("my")]
    [Authorize(Roles = "User")]
    public IActionResult MyBookings()
    {
        var email = User.FindFirst(ClaimTypes.Email)?.Value;

        var bookings = _context.Bookings
            .Where(b => b.UserEmail == email)
            .ToList();

        return Ok(bookings);
    }
}