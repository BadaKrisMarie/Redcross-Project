<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_users_can_register(): void
    {
        Mail::fake();
        $this->seed(RoleSeeder::class);

        $response = $this->post('/register', [
            'first_name'            => 'Juan',
            'last_name'             => 'Dela Cruz',
            'email'                 => 'juan@example.com',
            'phone'                 => '09171234567',
            'address'               => 'Poblacion, Muntinlupa',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertRedirect(route('login'));
        $this->assertDatabaseHas('users', [
            'name'      => 'Juan Dela Cruz',
            'email'     => 'juan@example.com',
            'phone'     => '09171234567',
            'address'   => 'Poblacion, Muntinlupa',
            'status'    => 'pending',
            'birthdate' => null,
            'gender'    => null,
        ]);
    }
}
